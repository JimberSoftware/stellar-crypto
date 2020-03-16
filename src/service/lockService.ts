import {getConfig} from "./stellarService";
import {Keypair} from "stellar-sdk";

export const getLockedBalances = async (keypair: Keypair) => {
    const {server} = getConfig();

    const accounts = server.accounts().forSigner(keypair.publicKey());

    const accountRecord = await accounts.call();
    return accountRecord.records
        .filter(a => a.id !== keypair.publicKey())
        .map(account => {
            return {
                id: account.id,
                balance: account.balances.find(b => b.asset_type === 'credit_alphanum4' && b.asset_code === 'TFT').balance
            }
        });
};