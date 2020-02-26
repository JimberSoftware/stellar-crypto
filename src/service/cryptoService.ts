import { mnemonicToEntropy } from "bip39";
import { SiaBinaryEncoder } from "../tfchain/tfchain.encoding.siabin";
import { blake2b } from "@waves/ts-lib-crypto";
import { Keypair } from "stellar-sdk";
import { decodeHex, sign } from "tweetnacl-ts";
import { getEntropyFromPhrase } from "mnemonicconversion2924";
import {AssymetricSignKeyPair} from "../tfchain/tfchain.polyfill.crypto.js"


export const keypairFromAccount: (seedPhrase: string, walletIndex: number) => Keypair = (seedPhrase: string, walletIndex: number) => {
    const seed: Uint8Array = getSeedFromSeedPhrase(seedPhrase)

    const encoder = SiaBinaryEncoder();

    encoder.add_array(seed);
    encoder.add_int(walletIndex);

    // h in go file
    const blake2b1Hash: Uint8Array = blake2b(encoder.data);

    return Keypair.fromRawEd25519Seed(<Buffer>blake2b1Hash);
};

export const revineAddressFromSeed: (seedPhrase: string, walletIndex: number) => String = (seedPhrase: string, walletIndex: number) => {
    const seed: Uint8Array = getSeedFromSeedPhrase(seedPhrase)

    const encoder = SiaBinaryEncoder();

    encoder.add_array(seed);
    encoder.add_int(walletIndex);

    // h in go file
    const entropy: Uint8Array = blake2b(encoder.data);
    return AssymetricSignKeyPair(entropy)

};
function getSeedFromSeedPhrase(seedPhrase: string): Uint8Array {
    if (seedPhrase.split(' ').length === 29) {
        return getEntropyFromPhrase(seedPhrase.split(' '))
    }

    const entropy = mnemonicToEntropy(seedPhrase);
    return decodeHex(entropy)
}
