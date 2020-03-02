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


// var fetch : fetch = (typeof window !== 'undefined') 
//     ? window.fetch 
//     : require('node-fetch');

import fetch from 'node-fetch'

const getConfig: () => {
  server: Server;
  serverURL: string;
  network: string;
  tftIssuer: string;
  conversionserviceUrl: string;
} = () => {
  // @todo: config
  // @todo: make this better

  let serverURL = "https://horizon-testnet.stellar.org";
  let network = Networks.TESTNET;
  let tftIssuer = "GA47YZA3PKFUZMPLQ3B5F2E3CJIB57TGGU7SPCQT2WAEYKN766PWIMB3";
  let conversionserviceUrl =
    "https://testnet.threefold.io/threefoldfoundation/conversion_service";

  if (typeof window !== "undefined") {
    serverURL =
      (<any>window)?.stellarServerUrl || "https://horizon.stellar.org";
    network = (<any>window)?.stellarNetwork || Networks.PUBLIC;
    tftIssuer =
      (<any>window)?.tftIssuer ||
      "GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47";
    conversionserviceUrl = (<any>window)?.conversionserviceUrl || ""; //@todo prod url?
  }

  const server = new Server(serverURL);
  return {
    server,
    serverURL,
    network,
    tftIssuer,
    conversionserviceUrl
  };
};

export const generateAccount: (
  stellarPair: Keypair,
  tfchainAddress: String
) => Promise<void> = async (stellarPair: Keypair, tfchainAddress: String) => {
  console.log(JSON.stringify({
    tfchain_address: tfchainAddress,
    address: stellarPair.publicKey()
  }));

  const requestOptions = {
    method: "POST",
    body: JSON.stringify({
      "args": {
        "tfchain_address": tfchainAddress,
        "address": stellarPair.publicKey()
      }
    }),
    headers: {
      "Content-Type": "application/json"
    },
  };
  const { conversionserviceUrl } = getConfig();
  const response = await fetch(`${conversionserviceUrl}/activate_account`, requestOptions);
  const result = await response.text();
  console.log(result);

  await addTrustLine(stellarPair);
  await convertTokens(tfchainAddress, stellarPair.publicKey())
};

export const loadAcount: (pair: Keypair) => Promise<AccountResponse> = async (
  pair: Keypair
) => {
  const { server } = getConfig();
  return await server.loadAccount(pair.publicKey());
};
export const convertTokens: (tfchainAddress: String, stellarAddress: String) => Promise<void> = async (tfchainAddress: String, stellarAddress: String) => {
  const { conversionserviceUrl } = getConfig();

  const requestOptions = {
    method: "POST",
    body: JSON.stringify({
      "args": {
        "tfchain_address": tfchainAddress,
        "stellar_address": stellarAddress
      }
    }),
    headers: {
      "Content-Type": "application/json"
    },
  };

  const response = await fetch(`${conversionserviceUrl}/migrate_tokens`, requestOptions);
  const result = await response.text();
  console.log(result);
};

export const addTrustLine: (pair: Keypair) => Promise<void> = async (pair: Keypair) => {
  const { server, tftIssuer, network } = getConfig();
  const asset = new Asset("TFT", tftIssuer);
  const account = await loadAcount(pair);
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
  const res = await server.submitTransaction(tx)
  console.log(res)
};
