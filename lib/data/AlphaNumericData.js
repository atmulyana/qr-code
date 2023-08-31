//https://github.com/atmulyana/qr-code
//@flow strict-local
import type Buffer from '../BitBuffer';
const {Data} = require('../types');
const Mode = require('../mode');

const alphaNumeicChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
const valueMap: {[string]: number} = {};
{
    for (let i = 0, len = alphaNumeicChars.length; i < len; i++) {
        const ch = alphaNumeicChars[i];
        valueMap[ch] = i;
        if ('A' <= ch && ch <= 'Z') valueMap[ch.toLowerCase()] = i;
    }
}

class AlphaNumericData extends Data {
    #value: String;
    constructor(data: string | String) {
        super();
        this.#value = new String(data);
    }

    get bitsLength(): number {
        const length = this.length;
        return Math.floor(length / 2) * 11 + (length % 2) * 6;
    }

    get length(): number {
        return this.#value.length;
    }

    get mode(): $Values<typeof Mode> {
        return Mode.AlphaNumeric;
    }

    write(buffer: Buffer): void {
        const sVal = this.#value,
              charCount = alphaNumeicChars.length;
        let i, limit;

        const evalError = () => {
            throw new EvalError(`AlphaNumeric mode: The allowed characters are "${alphaNumeicChars}"`);
        }
        
        //every 2 characters is stored in 11 bits
        for (i = 0, limit = this.length - 1; i < limit; i += 2) {
            const value = valueMap[ sVal[i] ] * charCount
                        + valueMap[ sVal[i + 1] ];
            if (isNaN(value)) evalError();
            buffer.put(value, 11);
        }

        if (i < this.length) {
            const value = valueMap[ sVal[i] ];
            if (value === undefined) evalError();
            buffer.put(value, 6);
        }
    }
}

module.exports = AlphaNumericData;