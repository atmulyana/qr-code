//https://github.com/atmulyana/qr-code
//@flow strict-local
import type {Byte} from './types';

class QRBitBuffer {
    #buffer: Uint8Array;
    #length: number;
    
    constructor(maxByteLength: number) {
        this.#buffer = new Uint8Array(maxByteLength);
        this.#length = 0;
    }

    get length(): number {
        return this.#length;
    }

    get(index: number): boolean {
        const bufIndex = index >>> 3, // Math.floor(index / 8);
              bitIndex = index & 0x07; //index % 8
        return ((this.#buffer[bufIndex] || 0) & (0x80 >>> bitIndex)) != 0;
    }

    getByte(index: number): Byte {
        return this.#buffer[index];
    }

    put(num: number, length: number): void {
        let numIdx = 0;
        let index = this.#length >>> 3; //Math.floor(this.#length / 8);
        let maxPutCount = 8 - (this.#length & 0x07); //8 - (this.#length % 8)
        while (true) {
            const restOfBitsCount = length - numIdx;
            const putCount = Math.min(restOfBitsCount, maxPutCount);
            const mask = (1 << putCount) - 1; //make bit `1` as many as `putCount`
            const bits = (num >>> (restOfBitsCount - putCount)) & mask;
            this.#buffer[index] |= (bits << (maxPutCount - putCount)); 
            numIdx += putCount;
            if (numIdx >= length) break;
            index++;
            maxPutCount = 8;
        }
        this.#length += length;
        
        // for (let i = 0; i < length; i++) {
        //     this.putBit(( (num >>> (length - i - 1)) & 1 ) == 1);
        // }
    }

    putBit(bit: boolean): void {
        const bufIndex = this.#length >>> 3; //Math.floor(this.#length / 8)
        if (bufIndex >= this.#buffer.length)
            throw new Error("Index is beyond the maximum index.")
        if (bit) {
            const bitIndex = this.#length & 0x07; //this.#length % 8
            this.#buffer[bufIndex] |= (0x80 >>> bitIndex);
        }
        this.#length++;
    }
}

module.exports = QRBitBuffer;
