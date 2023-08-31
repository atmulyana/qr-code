//https://github.com/atmulyana/qr-code
//@flow strict-local
import type {Byte, Data, Value} from '../types';
const Mode = require('../mode');

function getDataBuffer(value: string | Uint8Array | Array<Byte> | Value): ?Data {
    if (typeof(value) == 'string' || Array.isArray(value) || (value instanceof Uint8Array)) {
        const Byte = require('./ByteData');
        return new Byte(value);
    }
    else if (value.mode === Mode.Numeric) {
        const Numeric = require('./NumericData');
        return new Numeric(value.data);
    }
    else if (value.mode === Mode.AlphaNumeric) {
        const AlphaNumeric = require('./AlphaNumericData');
        return new AlphaNumeric(value.data);
    }
    else if (value.mode === Mode.Byte) {
        const Byte = require('./ByteData');
        return new Byte(value.data);
    }
    else if (value.mode === Mode.Kanji) {
        const Kanji = require('./KanjiData');
        return new Kanji(value.data);
    }
    else {
        return null;
    }
}

module.exports = getDataBuffer;