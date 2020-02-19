import { mnemonicToEntropy } from "bip39";
import { SiaBinaryEncoder } from "../tfchain/tfchain.encoding.siabin";
import { blake2b } from "@waves/ts-lib-crypto";
import { Keypair } from "stellar-sdk";
import { decodeHex } from "tweetnacl-ts";
import { getEntropyFromPhrase } from "mnemonicconversion2924";

export const keypairFromAccount: (seedPhrase: string, walletIndex: number) => Keypair = (seedPhrase: string, walletIndex: number) => {
    const seed: Uint8Array = getSeedFromSeedPhrase(seedPhrase)

    const encoder = SiaBinaryEncoder();

    encoder.add_array(seed);
    encoder.add_int(walletIndex);

    // h in go file
    const blake2b1Hash: Uint8Array = blake2b(encoder.data);

    return Keypair.fromRawEd25519Seed(<Buffer>blake2b1Hash);
};

function getSeedFromSeedPhrase(seedPhrase: string): Uint8Array {
    if (seedPhrase.split(' ').length === 29) {
        return getEntropyFromPhrase(seedPhrase.split(' '))
    }

    const entropy = mnemonicToEntropy(seedPhrase);
    return decodeHex(entropy)
}
