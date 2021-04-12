import web3 from 'web3'

export function convertBep20ToStellarMemo(address: string): string {
    if (!web3.utils.isAddress(address)) {
        throw Error('BEP20 Address is not valid')
    }

    return Buffer.from(address.replace('0x', ''), 'hex').toString('base64')
}

export function hex2a (hex: string): string {
    var str = ''
    for (var i = 0; i < hex.length; i += 2) {
        var v = parseInt(hex.substr(i, 2), 16)
        if (v) str += String.fromCharCode(v)
    }
    return str
}