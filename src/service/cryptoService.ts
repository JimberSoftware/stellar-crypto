import { mnemonicToEntropy } from "bip39";
import { SiaBinaryEncoder } from "../tfchain/tfchain.encoding.siabin";
import { blake2b } from "@waves/ts-lib-crypto";
import { Keypair } from "stellar-sdk";
import { sign_keyPair_fromSeed } from "tweetnacl-ts";
import { getEntropyFromPhrase } from "mnemonicconversion2924";

export const decodeHex: (hexString: String) => Uint8Array = hexString => {
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

export const encodeHex: (bytes: Uint8Array) => String = bytes => {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
}

export function calculateWalletEntropyFromAccount(seedPhrase: string, walletIndex: number): Uint8Array {
    var seed: Uint8Array = getSeedFromSeedPhrase(seedPhrase)

    if (seed.length >= 33) {
        seed = seed.slice(0, 32)
    }

    const encoder = SiaBinaryEncoder();

    encoder.add_array(seed);

    if (walletIndex != -1 && seed.length === 32) {
        encoder.add_int(walletIndex);
    }

    // h in go file
    const blake2b1Hash: Uint8Array = blake2b(encoder.data);

    return blake2b1Hash;
};

export function keypairFromAccount(walletEntropy: Uint8Array): Keypair {
    return Keypair.fromRawEd25519Seed(<Buffer>walletEntropy);
};

export const revineAddressFromSeed: (seedPhrase: string, walletIndex: number) => String = (seedPhrase: string, walletIndex: number) => {
    var entropy = getSeedFromSeedPhrase(seedPhrase)

    if (entropy.length >= 33) {
        entropy = entropy.slice(0, 32)
    }

    let encoder = SiaBinaryEncoder();
    encoder.add_array(entropy);

    if (walletIndex != -1) {
        encoder.add_int(walletIndex);
    }

    const seed = blake2b(encoder.data);

    const asyncKeyPair = sign_keyPair_fromSeed(seed)

    const publicKey = asyncKeyPair.publicKey

    const prefix1 = new Uint8Array([101, 100, 50, 53, 53, 49, 57, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0])
    const prefix2 = new Uint8Array([56, 0, 0, 0, 0, 0, 0, 0])

    const encodedData = new Uint8Array([...prefix2, ...prefix1, ...publicKey])

    var hash = blake2b(encodedData);
    var publicKeyAsHex = encodeHex(hash)
    var checksum = encodeHex(blake2b(new Uint8Array([1, ...hash])).slice(0, 6));

    return `01${publicKeyAsHex}${checksum}`
};
function getSeedFromSeedPhrase(seedPhrase: string): Uint8Array {
    const splitSeedPhrase = seedPhrase.split(' ')

    if (splitSeedPhrase.length === 29) {
        return getEntropyFromPhrase(splitSeedPhrase)
    }

    // App wallets
    if (splitSeedPhrase.length === 25 && splitSeedPhrase[splitSeedPhrase.length - 1] === "stellar") {
        splitSeedPhrase.pop()
        seedPhrase = splitSeedPhrase.join(" ");

        const entropy = mnemonicToEntropy(seedPhrase);

        var original = decodeHex(entropy);

        var arr = [].slice.call(original)
        arr.add(0)

        var modified = Uint8Array.from(arr)
        return modified;
    } else {
        const entropy = mnemonicToEntropy(seedPhrase);
        return decodeHex(entropy)
    }
}
