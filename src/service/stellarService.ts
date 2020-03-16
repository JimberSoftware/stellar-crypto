import StellarSdk, {
  AccountResponse,
  Keypair,
  Server,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  Network,
  Memo,
  BASE_FEE,
  Transaction
} from "stellar-sdk";
import axios from 'axios';

export const getConfig: () => {
  server: Server;
  serverURL: string;
  network: string;
  tftIssuer: string;
  serviceUrl: string;
} = () => {
  // @todo: config
  // @todo: make this better

  let serverURL = "https://horizon-testnet.stellar.org";
  let network = Networks.TESTNET;
  let tftIssuer = "GA47YZA3PKFUZMPLQ3B5F2E3CJIB57TGGU7SPCQT2WAEYKN766PWIMB3";
  let serviceUrl =
    "https://testnet.threefold.io/threefoldfoundation";

  if (typeof window !== "undefined") {
    serverURL =
      (<any>window)?.stellarServerUrl || "https://horizon.stellar.org";
    network = (<any>window)?.stellarNetwork || Networks.PUBLIC;
    tftIssuer =
      (<any>window)?.tftIssuer ||
      "GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47";
    serviceUrl = (<any>window)?.serviceUrl || ""; //@todo prod url?
  }

  const server = new Server(serverURL);
  return {
    server,
    serverURL,
    network,
    tftIssuer,
    serviceUrl
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
  const { serviceUrl } = getConfig();

  const response = await axios.post(`${serviceUrl}/conversion_service/migrate_tokens`, {
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
  const { serviceUrl } = getConfig();
  const response = await axios.post(`${serviceUrl}/conversion_service/activate_account`, {
    args: {
      tfchain_address: tfchainAddress,
      address: stellarPair.publicKey()
    }
  });
  // const response = await fetch(`${serviceUrl}/activate_account`, requestOptions);
  const activateAccountresult = response.data;
  console.log({ activateAccountresult });
}

export const buildFundedPaymentTransaction = async (sourceKeyPair: Keypair, destination: string, amount: number, message: string = '') => {
  const { server, tftIssuer } = getConfig();
  // Transaction will hold a built transaction we can resubmit if the result is unknown.
  let transaction;

  try {

    await server.loadAccount(destination)
    // If the account is not found, surface a nicer error message for logging.
  } catch (error) {
    if (error instanceof StellarSdk.NotFoundError) {
      throw new Error('The destination account does not exist!');
    } else {
      throw error
    };

  }
  // First, check to make sure that the destination account exists.
  // You could skip this, but if the account does not exist, you will be charged
  // the transaction fee when the transaction fails.
  const sourceAccount = await server.loadAccount(sourceKeyPair.publicKey());
  // Start building the transaction.
  transaction = new TransactionBuilder(sourceAccount, {
    fee: 0,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: destination,
        // Because Stellar allows transaction in many currencies, you must
        // specify the asset type. The special "native" asset represents Lumens.
        // @Todo use tft asset?
        asset: new Asset('TFT', tftIssuer),
        amount: amount.toFixed(3),
        source: sourceKeyPair.publicKey(),
      })
    )
    // A memo allows you to add your own metadata to a transaction. It's
    // optional and does not affect how Stellar treats the transaction.
    .addMemo(Memo.text(message))
    // Wait a maximum of three minutes for the transaction
    .setTimeout(86400)
    .build();
  const xdrTransaction = transaction.toXDR()
  console.log(xdrTransaction);

  const { serviceUrl, network } = getConfig();

  let fundedTransaction: Transaction;
  try {

    const result = await axios.post(`${serviceUrl}/transactionfunding_service/fund_transaction`, {
      args: {
        transaction: xdrTransaction,
      }
    })

    console.log('transaction');
    console.log(result.data);

    //@TODO validation
    fundedTransaction = new Transaction(result.data, network)

    return fundedTransaction;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const submitFundedTransaction = async (fundedTransaction: Transaction, sourceKeyPair: Keypair) => {
  //@TODO user interaction for validation before signing ?

  // Sign the transaction to prove you are actually the person sending it.
  fundedTransaction.sign(sourceKeyPair);
  // And finally, send it off to Stellar!

  const { server } = getConfig();


  try {
    const result = await server.submitTransaction(fundedTransaction);
    console.log('Success! Results:', result);

  } catch (error) {
    console.error('Something went wrong!', error.response.data);
    // If the result is unknown (no response body, timeout etc.) we simply resubmit
    // already built transaction:
    // await server.submitTransaction(fundedTransaction);
  }
}