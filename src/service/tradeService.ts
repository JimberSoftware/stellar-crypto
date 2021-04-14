import { Asset, Keypair, Operation, OperationOptions, TransactionBuilder } from 'stellar-sdk';
import { getConfig, loadAccount, submitFundedTransaction } from './stellarService';

function getTradeOperation(
    currencies: Object,
    sellAssetCode: string,
    buyAssetCode: string,
    amount: number,
    price: number,
    offerId: number
) {
    const sellAsset = new Asset(currencies[sellAssetCode].asset_code, currencies[sellAssetCode].issuer);
    const buyAsset = new Asset(currencies[buyAssetCode].asset_code, currencies[buyAssetCode].issuer);
    const sellOfferOptions: OperationOptions.ManageSellOffer = {
        amount: amount.toFixed(8),
        buying: buyAsset,
        price: price.toFixed(8),
        selling: sellAsset,
        offerId,
    };
    return Operation.manageSellOffer(sellOfferOptions);
}

export const sellAssetForTFT = async (
    keyPair: Keypair,
    sellAssetCode: string,
    price: number,
    amount: number,
    offerId: number = 0
): Promise<number> => {
    const account = await loadAccount(keyPair);
    const { currencies, server, network } = getConfig();

    const fee = await server.fetchBaseFee();
    const transactionBuilder = new TransactionBuilder(account, {
        fee: '0',
        networkPassphrase: network,
    });
    const buyAssetCode = 'TFT';
    const operation = getTradeOperation(currencies, sellAssetCode, buyAssetCode, amount, price, offerId);
    transactionBuilder.addOperation(operation);

    transactionBuilder.setTimeout(3000);

    const transaction = transactionBuilder.build();

    // fee_bump
    const result = await submitFundedTransaction(transaction, keyPair);

    console.log(result);
    return 0;
};

export const sellTft = async (
    keyPair: Keypair,
    buyAssetCode: string,
    price: number,
    amount: number,
    offerId: number = 0
) => {
    // @todo
    throw new Error('not yet implemented');
};

export const getOpenTradeOffers = async (keyPair: Keypair) => {
    const account = await loadAccount(keyPair);
    const tradeOffers = await account.offers();
    return tradeOffers.records;
};

export const closeTradeOffer = async (keyPair: Keypair, offerid: number) => {
    const openTradeOffers = await getOpenTradeOffers(keyPair);

    const existingTradeOffer = openTradeOffers.find(openTradeOffer => Number(openTradeOffer.id) === offerid);

    if (!existingTradeOffer) {
        throw new Error(`offerid not found: ${offerid}`);
    }

    await sellAssetForTFT(keyPair, existingTradeOffer.buying.asset_code, Number(existingTradeOffer.price), 0, offerid);
};
