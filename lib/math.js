//https://github.com/atmulyana/qr-code
//@flow strict-local
import type {Byte} from './types';
const expTable = new Uint8Array(256);
const logTable = new Uint8Array(256);

for (let i = 0; i < 8; i++) {
    expTable[i] = 1 << i;
}
for (let i = 8; i < 256; i++) {
    expTable[i] = expTable[i - 4]
        ^ expTable[i - 5]
        ^ expTable[i - 6]
        ^ expTable[i - 8];
}
for (let i = 0; i < 256; i++) {
    logTable[ expTable[i] ] = i;
}

module.exports = {
    glog(n: number): Byte {
        if (n < 1) {
            throw new Error("glog(" + n + ")");
        }
        return logTable[n];
    },

    gexp(pn: number): Byte {
        let n = pn;
        while (n < 0) {
            n += 255;
        }
        while (n >= 256) {
            n -= 255;
        }
        return expTable[n];
    },
};
