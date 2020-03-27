import {getConfig} from "./stellarService";
import {Keypair, Transaction} from "stellar-sdk";
import axios from 'axios';


export const fetchUnlockTransaction = async (unlockHash: string) => {
    const {serviceUrl} = getConfig();
    const result = await axios.post(`${serviceUrl}/unlock_service/get_unlockhash_transaction`,
        {
            args: {unlockhash: unlockHash}
        }
    );

    //@todo: validation
    const {network} = getConfig();
    return new Transaction(result.data.transaction_xdr, network);

};

export const getLockedBalances = async (keyPair: Keypair) => {
    const {server} = getConfig();

    const accounts = server.accounts().forSigner(keyPair.publicKey());

    const accountRecord = await accounts.call();
    return accountRecord.records
        .filter(a => a.id !== keyPair.publicKey())
        .map(account => {
            return {
                id: account.id,
                balance: account.balances.find(b => b.asset_type === 'credit_alphanum4' && b.asset_code === 'TFT').balance,
                unlockHash: account.signers.find(s => s.type === 'preauth_tx').key,
            }
        });
};