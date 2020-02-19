/*
Test scenario
Generated seed: treat gloom wrong topple learn device stable orchard essay bitter brand cattle amateur beach bulk build cluster quit survey news physical hole tower glass
Private key (1st one generated from the seed): 1698405035c751f9cfb42089ce71345a03fa9a7ae66976e21299bfb3ebf37272
Generated address: 015c403d0bcf9b889c81a78cd4b93fbb27b6f31ef9c45ae73ed9c7ea3a01c938023160920f3d0b
Stellar Seed: SALJQQCQGXDVD6OPWQQITTTRGRNAH6U2PLTGS5XCCKM37M7L6NZHF7HN
Stellar address: GBTJEFDDMA5N4TDBFLJGA6K3MQFNHR2KUUFYAKYCOAEE43JD4CP3UTQC
Rivine address from Stellar address: 015c403d0bcf9b889c81a78cd4b93fbb27b6f31ef9c45ae73ed9c7ea3a01c938023160920f3d0b
*/

import { keypairFromAccount } from "./cryptoService";

const seedPhrase: string = "treat gloom wrong topple learn device stable orchard essay bitter brand cattle amateur beach bulk build cluster quit survey news physical hole tower glass";
const seedPhrase29words: string = "fully mobile shyness pixels sapling match yacht shipped aisle angled olive awful volcano dented knuckle jostle aching yodel austere peeled fowls punch cedar owls lumber ascend noted oyster acumen";

describe('crypto', () => {
    it('should generate correct first stellar keypair', () => {
        const keypair = keypairFromAccount(seedPhrase, 0);

        expect(keypair.secret()).toBe("SALJQQCQGXDVD6OPWQQITTTRGRNAH6U2PLTGS5XCCKM37M7L6NZHF7HN");
        expect(keypair.publicKey()).toBe("GBTJEFDDMA5N4TDBFLJGA6K3MQFNHR2KUUFYAKYCOAEE43JD4CP3UTQC");

    });
    it('should generate correct second stellar keypair', () => {
        const keypair = keypairFromAccount(seedPhrase, 1);

        expect(keypair.secret()).toBe("SCIPCPF2BWIY6HCHVYYTOUX7YEJIKPDZJJQOS52LA6YOEITYVWUN4BBQ"); // don't worry about it
        expect(keypair.publicKey()).toBe("GCSXHYFBX5JVLOFTWDUIPRQRU23AF5C35C35WT7ADZ4QKOUXPNHK5RHC");

    });
    it('should generate correct stellar keypair from "deprecated" 29 word mnemonic', () => {
        const keypair = keypairFromAccount(seedPhrase29words, 0);

        expect(keypair.secret()).toBe("SBEK3DEGEK3CAS5HQJ5Z4IN7KQCSMU2RMHWT4BXJ2NYMZGFVYJ7HLO3K");
        expect(keypair.publicKey()).toBe("GBQB5QGEVLAKFBSJUXGNCK4RAL5P74UDTTY2IXKXKSO55SWIBRFWBDCE");

    });
});
