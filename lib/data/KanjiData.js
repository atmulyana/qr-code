//https://github.com/atmulyana/qr-code
//@flow strict-local
import type Buffer from '../BitBuffer';
const {Data} = require('../types');
const Mode = require('../mode');
const Utf16ToSjis = require('utf16-to-sjis/dist/table').UTF16_TO_SJIS;

class KanjiData extends Data {
    #value: String;
    constructor(data: string | String) {
        super();
        this.#value = new String(data);
    }

    get bitsLength(): number {
        return this.length * 13;
    }

    get length(): number {
        return this.#value.length;
    }

    get mode(): $Values<typeof Mode> {
        return Mode.Kanji;
    }

    write(buffer: Buffer): void {
        const sVal = this.#value;
        
        //Every 1 character is stored in 13 bits. Before it, the javascript string (UTF-16) must be converted to Shift-JIS
        for (let i = 0, len = this.length; i < len; i++) {
            const utf16Code = sVal.charCodeAt(i);
            let sjisCode: ?number;
            //The mapping code is taken from `convert` function of "utf16-to-sjis" package.
            //We use only the part of the function is to gain the optimatization of performance
            if (utf16Code < 0x80) {
                sjisCode = utf16Code;
            }
            else if (0xff61 <= utf16Code && utf16Code <= 0xff9f) {
                sjisCode = utf16Code - 0xfec0; // map 0xff61...0xff9f to hankaku kana 0xa1...0xdf.
            }
            else {
                sjisCode = Utf16ToSjis[ utf16Code ];
            }

            //Shift-JIS string is also encoded in 16-bits characters. To shrink each character to be 13-bits character,
            //executed the following calculation
            if (0x8140 <= sjisCode && sjisCode <= 0x9FFC) {
                sjisCode -= 0x8140;
            }
            else if (0xE040 <= sjisCode && sjisCode <= 0xEBBF) {
                sjisCode -= 0xC140;
            }
            else {
                throw new EvalError(`Kanji mode: Not supported character '${sVal[i]}'`);
            }
            sjisCode = (sjisCode >>> 8) * 0xC0 + (sjisCode & 0xff);
            
            buffer.put(sjisCode, 13);
        }
    }
}

module.exports = KanjiData;