import { AccountResponse, Keypair, Server, TransactionBuilder, Operation, Asset, Networks, Network } from "stellar-sdk";

const getConfig: () => { server: Server, serverURL: string, network: string, tftIssuer: string, } = () => {
    // @todo: config
    // @todo: make this better

    let serverURL = "https://horizon-testnet.stellar.org";
    let network = Networks.TESTNET;
    let tftIssuer = 'GA47YZA3PKFUZMPLQ3B5F2E3CJIB57TGGU7SPCQT2WAEYKN766PWIMB3';

    if (typeof (window) !== 'undefined') {
        serverURL = (<any>window)?.stellarServerUrl || "https://horizon.stellar.org";
        network = (<any>window)?.stellarNetwork || Networks.PUBLIC;
        tftIssuer = (<any>window)?.tftIssuer || 'GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47';
    }

    const server = new Server(serverURL);

    return {
        server,
        serverURL,
        network,
        tftIssuer,
    }
}

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
    const { server } = getConfig()
    return await server.loadAccount(pair.publicKey())
};

export const addTrustLine: (pair: Keypair) => void = async (pair: Keypair) => {
    const { server, tftIssuer, network } = getConfig()
    const asset = new Asset('tft', tftIssuer)
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
    try {
        server.submitTransaction(tx)
            .then(
                res => { console.log('Success! Account Created.') },
                err => { throw err }
            )
    } catch (error) {
        console.log(error);
    }
}