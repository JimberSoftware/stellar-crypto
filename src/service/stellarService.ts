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
import axios from 'axios';

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
  console.log('activate account');

  await activateAccount(tfchainAddress, stellarPair);
  console.log('add trustline');
  await addTrustLine(stellarPair);
  console.log('convert tokens');
  await convertTokens(tfchainAddress, stellarPair.publicKey())
};

export const loadAccount: (pair: Keypair) => Promise<AccountResponse> = async (
  pair: Keypair
) => {
  const { server } = getConfig();
  return await server.loadAccount(pair.publicKey());
};
export const convertTokens: (tfchainAddress: String, stellarAddress: String) => Promise<void> = async (tfchainAddress: String, stellarAddress: String) => {
  const { conversionserviceUrl } = getConfig();

  const response = await axios.post(`${conversionserviceUrl}/migrate_tokens`, {
    args: {
      tfchain_address: tfchainAddress,
      stellar_address: stellarAddress
    }
  });
  const result = response.data;
  console.log(result);
};

export const addTrustLine: (pair: Keypair) => Promise<void> = async (pair: Keypair) => {
  const { server, tftIssuer, network } = getConfig();
  const asset = new Asset("TFT", tftIssuer);
  const account = await loadAccount(pair);
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
  const trustlineResult = await server.submitTransaction(tx)
  console.log(trustlineResult)
};
const activateAccount = async (tfchainAddress: String, stellarPair: Keypair) => {
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
  const response = await axios.post(`${conversionserviceUrl}/activate_account`, {
    args: {
      tfchain_address: tfchainAddress,
      address: stellarPair.publicKey()
    }
  });
  // const response = await fetch(`${conversionserviceUrl}/activate_account`, requestOptions);
  const activateAccountresult = response.data;
  console.log({ activateAccountresult });
}

