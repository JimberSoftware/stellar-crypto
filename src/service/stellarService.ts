import {AccountResponse, Keypair, Server, TransactionBuilder, Operation, Asset, Networks, Network} from "stellar-sdk";
//import fetch from "node-fetch"

// @todo: config
const serverURL = "https://horizon-testnet.stellar.org";
const server = new Server(serverURL);
const network = Networks.TESTNET

export const generateAccount: (pair: Keypair) => Promise<void> = async (pair: Keypair) => {
    const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(
            pair.publicKey()
        )}`
    );
    const responseJSON = await response.json();
    addTrustLine(pair)

    if (responseJSON?.detail?.includes('createAccountAlreadyExist')) {
        console.log("Account already generated");
        return;
    }
    console.log("SUCCESS! You have a new account :)");
};

export const loadAcount: (pair: Keypair) => Promise<AccountResponse> = async (pair: Keypair) => {
    return await server.loadAccount(pair.publicKey())
};

export const addTrustLine: (pair: Keypair) => void = async (pair: Keypair) => {    
    const asset = new Asset('tft','GA47YZA3PKFUZMPLQ3B5F2E3CJIB57TGGU7SPCQT2WAEYKN766PWIMB3')
    const account = await loadAcount(pair)
    console.log(pair.secret())
    const fee = await server.fetchBaseFee();

    const transaction = new TransactionBuilder(account, { 
        fee,
        networkPassphrase: network
        });
    transaction.addOperation(
        Operation.changeTrust({
            asset: asset
        })
    )
    transaction.setTimeout(3000)
    
    const tx = transaction.build()
    tx.sign(pair)
    try{
        server.submitTransaction(tx)
        .then(
            res => { console.log('Success! Account Created.') },
            err => { throw err }
            )
    }catch(error){
        console.log(error);
    }
}