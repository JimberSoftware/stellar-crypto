import {calculateWalletEntropyFromAccount, keypairFromAccount, revineAddressFromSeed} from "./cryptoService";
import {fetchUnlockTransaction, getLockedBalances} from "./lockService";
import {getConfig} from "./stellarService";


const seedPhrase: string = "enlist extend long diet crucial broccoli inhale tuna stuff sting miracle runway announce surprise dog limb second sun april reason they produce sick spray";

const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, 0);
const keypair = keypairFromAccount(walletEntropy);
console.log(keypair.publicKey())

describe('lockservice', () => {
    it('should have locked tokens', async () => {
        const lockedFunds = await getLockedBalances(keypair);

        console.log(lockedFunds);
        expect(lockedFunds).toStrictEqual([
            {
                id: 'GBS5U2ZBW6BO6JVZW72RUMLZFKRMILDPA7VE3DV7LYVYJHCOKP7JJ4HV',
                balance: '50.0000000',
                unlockHash: 'TAEYUR6Y2O2IQE4PXMIBGTTNUSLNBSQ3NGO4C5Z3RO4INHKYU6UUDPSY'
            }
        ])
    });
    it('should fetch unlockTransactionEnvelope', async () => {
        const [lockedFunds, ...rest] = await getLockedBalances(keypair);
        const unlockTransactionEnvelope = await fetchUnlockTransaction(lockedFunds.unlockHash);
        expect(unlockTransactionEnvelope.source).toEqual(lockedFunds.id)
    });
    it.skip('should unlock escrow account', async () => {
        const [lockedFunds, ...rest] = await getLockedBalances(keypair);
        const unlockTransaction = await fetchUnlockTransaction(lockedFunds.unlockHash);

        const { server } = getConfig();

        try {
            const result = await server.submitTransaction(unlockTransaction);
            console.log('Success! Results:', result);

        } catch (error) {
            console.error('Something went wrong!', error.response.data);
            // If the result is unknown (no response body, timeout etc.) we simply resubmit
            // already built transaction:
            // await server.submitTransaction(fundedTransaction);
        }

    });
});

