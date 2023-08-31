//https://github.com/atmulyana/qr-code
//@flow strict-local
import type {Byte} from '../types';
import type Buffer from '../BitBuffer';
const {Data} = require('../types');
const Mode = require('../mode');

type TypedArray = {
    buffer: ArrayBuffer,
    ...
};

class ByteData extends Data {
    #data: Uint8Array;

    constructor(data: Uint8Array | ArrayBuffer | TypedArray | Array<Byte> | string | String) {
        super();
        if (Array.isArray(data)) {
            this.#data = new Uint8Array(data);
        }
        else if (data instanceof Uint8Array) {
            this.#data = data;
        }
        else if (data instanceof ArrayBuffer) {
            this.#data = new Uint8Array(data);
        }
        else if (data.buffer instanceof ArrayBuffer) { //It can be Uint16Array, Uint32Array or the other TypedArrays (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
            this.#data = new Uint8Array(data.buffer);
        } else {
            const d = new String(data);
            //Converts UTF-16 to UTF-8 (https://medium.com/@vincentcorbee/utf-16-to-utf-8-in-javascript-18b4b11b6e1e)
            const len = d.length,
                  dataBytes = new Uint8Array(len * 3); //`len * 3` is the maximum count of bytes in UTF-8
            let j = 0;
            for (let i = 0; i < len; i++) {
                const c = d.charCodeAt(i);
                if (c <= 0x007f) { //US-ASCII
                    dataBytes[j++] = c;
                } else if (c <= 0x07ff) {
                    dataBytes[j++] = 0xc0 | (c >>> 6);
                    dataBytes[j++] = 0x80 | (c & 0x3f);
                } else if (0xd800 <= c && c <= 0xdbff) { //leading surrogate
                    const c2 = d.charCodeAt(i+1); //NaN if i+1 >= d.length
                    if (0xdc00 <= c2 && c2 <= 0xdfff) { //trailing surrogate
                        i++;
                        const codePoint = ((c - 0xd800) << 10) + (c2 - 0xDC00) + 0x10000;
                        dataBytes[j++] = 0xf0 | (codePoint >>> 18);
                        dataBytes[j++] = 0x80 | ((codePoint >>> 12) & 0x3f);
                        dataBytes[j++] = 0x80 | ((codePoint >>> 6) & 0x3f);
                        dataBytes[j++] = 0x80 | (codePoint & 0x3f);
                    }
                    else {
                        //lone surrogate (invalid char, cannot be encoded)
                    }
                } else if (0xdc00 <= c && c <= 0xdfff) { //trailing surrogate
                    //lone surrogate
                } else {
                    dataBytes[j++] = 0xe0 | (c >>> 12);
                    dataBytes[j++] = 0x80 | ((c >>> 6) & 0x3f);
                    dataBytes[j++] = 0x80 | (c & 0x3f);
                }
            }
            this.#data = dataBytes.subarray(0, j);
        }
    }

    get bitsLength(): number {
        return this.length * 8;
    }

    get length(): number {
        return this.#data.length;
    }

    get mode(): $Values<typeof Mode> {
        return Mode.Byte;
    }

    write(buffer: Buffer): void {
        const len = this.length;
        for (let i = 0; i < len; i++) {
            buffer.put(this.#data[i], 8);
        }
    }
}

module.exports = ByteData;