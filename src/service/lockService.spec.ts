import {calculateWalletEntropyFromAccount, keypairFromAccount, revineAddressFromSeed} from "./cryptoService";
import {getLockedBalances} from "./lockService";


const seedPhrase: string = "enlist extend limb diet crucial broccoli inhale trick stuff sting talent runway announce surprise dog limb second sun april reason they produce search slab";

const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, 0);
const keypair = keypairFromAccount(walletEntropy);
console.log(revineAddressFromSeed(seedPhrase, 0))

describe('lockservice', () => {
    it('should have locked tokens', async () => {
        const lockedFunds = await getLockedBalances(keypair);

        console.log(lockedFunds);
    });
});