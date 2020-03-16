import { calculateWalletEntropyFromAccount, keypairFromAccount, revineAddressFromSeed } from "./cryptoService";
import { generateAccount, loadAccount, convertTokens, addTrustLine, buildFundedPaymentTransaction, submitFundedTransaction } from "./stellarService";
import { generateMnemonic } from "bip39";
import { Keypair } from "stellar-sdk";
import { address } from "@waves/ts-lib-crypto";

const seedPhrase: string = "treat gloom wrong topple learn device stable orchard essay bitter brand cattle amateur beach bulk build cluster quit survey news physical hole tower glass";

const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, 0);
const keypair = keypairFromAccount(walletEntropy);

const revineKeypair = revineAddressFromSeed(seedPhrase, 0);
describe('stellar', () => {
    // can only be done the once and generating an account for every tests isn't particulary good 💩
    it.skip('should generate an account', async () => {

        console.log({ revine: revineKeypair, stellar: keypair.publicKey() });

        try {
            await generateAccount(keypair, revineKeypair);
        } catch (error) {
            console.log(error.request)
            console.log(error.response.data)
            throw error
        }
    }, 60000);

    it.skip('should convert tokens', async () => {
        console.log({ revine: revineKeypair, stellar: keypair.publicKey() });

        try {
            await convertTokens(revineKeypair, keypair.publicKey());
        } catch (error) {
            console.log(error.request)
            console.log(error.response.data)
            throw error
        }
    }, 60000);

    it('should load an account', async () => {
        let accountResponse = await loadAccount(keypair);
        expect(accountResponse.accountId()).toBe('GBTJEFDDMA5N4TDBFLJGA6K3MQFNHR2KUUFYAKYCOAEE43JD4CP3UTQC');
    });

    it('should do payment with tft', async () => {

        const paymentSeedPhrase = "enlist extend limb diet crucial broccoli inhale trick stuff sting talent runway announce surprise dog limb second sun april reason they produce search slab"

        const walletEntropy = calculateWalletEntropyFromAccount(paymentSeedPhrase, 0);
        const keypairDaily = keypairFromAccount(walletEntropy);


        console.log(keypairDaily.secret())

        const walletEntropy2 = calculateWalletEntropyFromAccount(paymentSeedPhrase, 0);
        const keypairSavings = keypairFromAccount(walletEntropy2);

        const fundedTransaction = await buildFundedPaymentTransaction(keypairDaily, keypairSavings.publicKey(), 1, 'test');
        
        await submitFundedTransaction(fundedTransaction, keypairDaily);
    }, 30000);
});