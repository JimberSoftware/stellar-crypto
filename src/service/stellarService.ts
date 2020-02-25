import {
  AccountResponse,
  Keypair,
  Server,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  Network
} from "stellar-sdk";

// @todo: config
// @todo: make this better

let serverURL = "https://horizon-testnet.stellar.org";
let network = Networks.TESTNET;
let tftIssuer = "GA47YZA3PKFUZMPLQ3B5F2E3CJIB57TGGU7SPCQT2WAEYKN766PWIMB3";
let conversionserviceUrl = "https://testnet.threefold.io/threefoldfoundation/conversion_service"


if (typeof window !== "undefined") {
  serverURL = (<any>window)?.stellarServerUrl || "https://horizon.stellar.org";
  network = (<any>window)?.stellarNetwork || Networks.PUBLIC;
  tftIssuer =
    (<any>window)?.tftIssuer ||
    "GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47";
  conversionserviceUrl = (<any>window)?.conversionserviceUrl || "" //@todo prod url?
}

const server = new Server(serverURL);

export const generateAccount: (stellarPair: Keypair, tfchainPair) => Promise<void> = async (
    stellarPair: Keypair, tfchainPair
) => {
  const requestOptions = {
    method: "POST",
    body: JSON.stringify({
      args: {
        tfchain_address: tfchainPair.pub,
        stellar_address:
        stellarPair.publicKey()
      }
    })
  };

  fetch(
    "https://testnet.threefold.io/threefoldfoundation/conversion_service/migrate_tokens",
    requestOptions
  )
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log("error", error));

  addTrustLine(stellarPair);
};

export const loadAcount: (pair: Keypair) => Promise<AccountResponse> = async (
  pair: Keypair
) => {
  return await server.loadAccount(pair.publicKey());
};

export const addTrustLine: (pair: Keypair) => void = async (pair: Keypair) => {
  const asset = new Asset("tft", tftIssuer);
  const account = await loadAcount(pair);
  console.log(pair.secret());
  const fee = await server.fetchBaseFee();

  const transaction = new TransactionBuilder(account, {
    fee,
    networkPassphrase: network
  });
  transaction.addOperation(
    Operation.changeTrust({
      asset: asset
    })
  );
  transaction.setTimeout(3000);

  const tx = transaction.build();
  tx.sign(pair);
  try {
    server.submitTransaction(tx).then(
      res => {
        console.log("Success! Account Created.");
      },
      err => {
        throw err;
      }
    );
  } catch (error) {
    console.log(error);
  }
};
