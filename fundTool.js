const { generateMnemonic } = require("bip39");
const { keypairFromAccount } = require("./dist/service/cryptoService");
const { addTrustLine } = require("./dist/service/stellarService");
const axios = require('axios')

async function name() {
  const testSeedPhrase = generateMnemonic(256);
  console.log(testSeedPhrase);
  const kp = keypairFromAccount(testSeedPhrase, 0);
  await axios.get("https://friendbot.stellar.org", {
    params: {
      addr: kp.publicKey()
    }
  });
  await addTrustLine(kp);
}

name().then(() => console.log("done"));
