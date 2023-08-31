//https://github.com/atmulyana/qr-code
//@flow strict-local
import type {Byte} from './types';
const math = require('./math');

class QRPolynomial {
    #num: Uint8Array;

    constructor(num: Array<Byte> | Uint8Array, shift: number) {
        if (!Array.isArray(num) && !(num instanceof Uint8Array)) {
            throw new Error("`num` is not an array");
        }

        let offset = 0;
        while (offset < num.length && num[offset] == 0) {
            offset++;
        }

        this.#num = new Uint8Array(num.length - offset + shift);
        for (let i = 0; i < num.length - offset; i++) {
            this.#num[i] = num[i + offset];
        }
    }


    get(index: number): Byte {
        return this.#num[index];
    }

    get length(): number {
        return this.#num.length;
    }

    multiply(e: QRPolynomial): QRPolynomial {
        const len1 = this.length,
              len2 = e.length,
              num = new Uint8Array(len1 + len2 - 1);

        for (let i = 0; i < len1; i++) {
            for (let j = 0; j < len2; j++) {
                num[i + j] ^= math.gexp( math.glog(this.get(i)) + math.glog(e.get(j)) );
            }
        }

        return new QRPolynomial(num, 0);
    }

    mod(e: QRPolynomial): QRPolynomial {
        const len1 = this.length,
              len2 = e.length;
        if (len1 - len2 < 0) {
            return this;
        }

        const ratio = math.glog( this.get(0) ) - math.glog( e.get(0) ),
        num = new Uint8Array(len1);

        for (let i = 0; i < len1; i++) {
            num[i] = this.get(i);
        }

        for (let i = 0; i < len2; i++) {
            num[i] ^= math.gexp( math.glog(e.get(i)) + ratio );
        }

        return new QRPolynomial(num, 0).mod(e);
    }
}

module.exports = QRPolynomial;
