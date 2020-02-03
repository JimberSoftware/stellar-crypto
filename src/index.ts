import {keypairFromAccount} from "./service/cryptoService";
import {KeyPair} from "./types";
import StellarSdk from "stellar-sdk";
import { decodeBase64 } from "tweetnacl-util";

export const convertTfAccount = (seedPhrase: string, walletAmount: number = 1, startIndex: number = 1) => {
    for (let i = 0; i < walletAmount; i++) {
        const pair: KeyPair = keypairFromAccount(seedPhrase, startIndex + i);


        // console.log(pair);
    }
};




export const test = async () => {
    // const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
    // let seed = "dZS/ZkLaiUPSw2e2ZC8iU0QbpbVsKypey7qWPxNIdUw=";
    // seed = new Uint8Array(decodeBase64(seed));
    // const pair = StellarSdk.Keypair.fromRawEd25519Seed(seed);
    //
    // console.log(secret, pair.secret());
    // // SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
    // console.log(pubkey, pair.publicKey());
    //
    // const account = await server.loadAccount(pair.publicKey());
    // console.log("Balances for account: " + pair.publicKey());
    // account.balances.forEach(function(balance) {
    //     console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
    // });
    // console.log(account);
};

export const generateAccount = async pair => {
    // try {
    //     const response = await fetch(
    //         `https://friendbot.stellar.org?addr=${encodeURIComponent(
    //             pair.publicKey()
    //         )}`
    //     );
    //     const responseJSON = await response.json();
    //     console.log("SUCCESS! You have a new account :)\n", responseJSON);
    // } catch (e) {
    //     console.error("ERROR!", e);
    // }
};