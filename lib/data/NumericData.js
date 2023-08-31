//https://github.com/atmulyana/qr-code
//@flow strict-local
import type Buffer from '../BitBuffer';
const {Data} = require('../types');
const Mode = require('../mode');

const valueMap: {[string]: number} = {};
{
    for (let v = 0; v < 10; v++) valueMap[v+''] = v;
}

class NumericData extends Data {
    #value: String;
    constructor(data: string | String | number) {
        super();
        this.#value = new String(data);
    }

    get bitsLength(): number {
        const length = this.length,
              mod = (length % 3) || 3;
        return Math.ceil(length / 3) * 10 - (3 - mod) * 3;
    }

    get length(): number {
        return this.#value.length;
    }

    get mode(): $Values<typeof Mode> {
        return Mode.Numeric;
    }

    write(buffer: Buffer): void {
        const len = this.length,
              sVal = this.#value,
              rest = len % 3;

        const getValue: number => number = value => {
            if (isNaN(value)) throw new EvalError('Numeric mode: The value must be a non-negative round number');
            return value;
        }
        
        //every 3 digits is saved in 10 bits
        for (let i = 2; i < len; i += 3) {
            const value = getValue(
                valueMap[ sVal[i - 2] ] * 100
                + valueMap[ sVal[i - 1] ] * 10
                + valueMap[ sVal[i] ]
            );
            buffer.put(value, 10);
        }

        if (rest == 1) {
            const value = getValue( valueMap[ sVal[len-1] ] );
            buffer.put(value, 4);
        }
        else if (rest == 2) {
            const value = getValue( valueMap[ sVal[len-2] ] * 10 + valueMap[ sVal[len-1] ] );
            buffer.put(value, 7);
        }
    }
}

module.exports = NumericData;