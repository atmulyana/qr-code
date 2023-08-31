//https://github.com/atmulyana/qr-code
//@flow strict-local
import type {Version} from './types';
import type QRCode from './QRCode';
const math = require('./math');
const Mode = require('./mode');
const Polynomial = require('./Polynomial');

const QRMaskFunctions: Array<(number, number) => boolean> = [
    (i, j) => ((i + j) & 1) == 0, //(i + j) % 2 == 0
    (i, j) => (i & 1) == 0, //i % 2 == 0
    (i, j) => j % 3 == 0,
    (i, j) => (i + j) % 3 == 0,
    (i, j) => ( ((i >>> 1) + Math.floor(j / 3)) & 1 ) == 0, //(Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0
    (i, j) => ((i * j) & 1) + (i * j) % 3 == 0, //(i * j) % 2 + (i * j) % 3 == 0
    (i, j) => (( ((i * j) & 1) + (i * j) % 3 ) & 1) == 0, //( (i * j) % 2 + (i * j) % 3 ) % 2 == 0
    (i, j) => (( (i * j) % 3 + ((i + j) & 1) ) & 1) == 0,  //( (i * j) % 3 + (i + j) % 2 ) % 2 == 0
];

const PatternPositionTable: $ReadOnlyArray<Uint8Array> = [
    new Uint8Array(0),
    Uint8Array.from([6, 18]),
    Uint8Array.from([6, 22]),
    Uint8Array.from([6, 26]),
    Uint8Array.from([6, 30]),
    Uint8Array.from([6, 34]),
    Uint8Array.from([6, 22, 38]),
    Uint8Array.from([6, 24, 42]),
    Uint8Array.from([6, 26, 46]),
    Uint8Array.from([6, 28, 50]),
    Uint8Array.from([6, 30, 54]),		
    Uint8Array.from([6, 32, 58]),
    Uint8Array.from([6, 34, 62]),
    Uint8Array.from([6, 26, 46, 66]),
    Uint8Array.from([6, 26, 48, 70]),
    Uint8Array.from([6, 26, 50, 74]),
    Uint8Array.from([6, 30, 54, 78]),
    Uint8Array.from([6, 30, 56, 82]),
    Uint8Array.from([6, 30, 58, 86]),
    Uint8Array.from([6, 34, 62, 90]),
    Uint8Array.from([6, 28, 50, 72, 94]),
    Uint8Array.from([6, 26, 50, 74, 98]),
    Uint8Array.from([6, 30, 54, 78, 102]),
    Uint8Array.from([6, 28, 54, 80, 106]),
    Uint8Array.from([6, 32, 58, 84, 110]),
    Uint8Array.from([6, 30, 58, 86, 114]),
    Uint8Array.from([6, 34, 62, 90, 118]),
    Uint8Array.from([6, 26, 50, 74, 98, 122]),
    Uint8Array.from([6, 30, 54, 78, 102, 126]),
    Uint8Array.from([6, 26, 52, 78, 104, 130]),
    Uint8Array.from([6, 30, 56, 82, 108, 134]),
    Uint8Array.from([6, 34, 60, 86, 112, 138]),
    Uint8Array.from([6, 30, 58, 86, 114, 142]),
    Uint8Array.from([6, 34, 62, 90, 118, 146]),
    Uint8Array.from([6, 30, 54, 78, 102, 126, 150]),
    Uint8Array.from([6, 24, 50, 76, 102, 128, 154]),
    Uint8Array.from([6, 28, 54, 80, 106, 132, 158]),
    Uint8Array.from([6, 32, 58, 84, 110, 136, 162]),
    Uint8Array.from([6, 26, 54, 82, 110, 138, 166]),
    Uint8Array.from([6, 30, 58, 86, 114, 142, 170])
];

const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
const G18 =  (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
const G15Mask = (1 << 14) | (1 << 12) | (1 << 10)	| (1 << 4) | (1 << 1);

const QRUtil = {
    getBCHTypeInfo(data: number): number {
        let d = data << 10;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(G15) >= 0) {
            d ^= ( G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(G15)) ); 	
        }
        return ((data << 10) | d) ^ G15Mask;
    },

    getBCHVersion(data: number): number {
        let d = data << 12;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(G18) >= 0) {
            d ^= ( G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(G18)) ); 	
        }
        return (data << 12) | d;
    },

    getBCHDigit(data: number): number {
        let digit = 0,
        d = data;

        while (d != 0) {
            digit++;
            d >>>= 1;
        }

        return digit;
    },

    getPatternPosition(version: Version): Uint8Array {
        return PatternPositionTable[version - 1];
    },

    getMaskFunction(maskPattern: number): ((number, number) => boolean) {
        const func = QRMaskFunctions[maskPattern];
        if (!func) throw new Error("bad maskPattern:" + maskPattern);
        return func;
    },

    getErrorCorrectPolynomial(errorCorrectLength: number): Polynomial {
        let a = new Polynomial([1], 0);
        for (let i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new Polynomial([1, math.gexp(i)], 0) );
        }
        return a;
    },

    getLengthInBits(mode: $Values<typeof Mode>, version: number): number {
        if (1 <= version && version < 10) {

            // 1 - 9
            switch(mode) {
                case Mode.Numeric       : return 10;
                case Mode.AlphaNumeric  : return 9;
                case Mode.Byte          : return 8;
                case Mode.Kanji         : return 8;
                default :
                    throw new Error("bad mode:" + mode);
            }

        } else if (version < 27) {

            // 10 - 26
            switch(mode) {
                case Mode.Numeric       : return 12;
                case Mode.AlphaNumeric  : return 11;
                case Mode.Byte          : return 16;
                case Mode.Kanji         : return 10;
                default :
                    throw new Error("bad mode:" + mode);
            }

        } else if (version < 41) {

            // 27 - 40
            switch(mode) {
                case Mode.Numeric       : return 14;
                case Mode.AlphaNumeric  : return 13;
                case Mode.Byte          : return 16;
                case Mode.Kanji         : return 12;
                default :
                    throw new Error("bad mode:" + mode);
            }

        } else {
            throw new Error("bad version:" + version);
        }
    },

    getLostPoint(qrCode: QRCode): number {
        const moduleCount = qrCode.moduleCount;
        let lostPoint = 0;

        // LEVEL1
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                let sameCount = 0,
                    dark = qrCode.isDark(row, col);

                for (let r = -1; r <= 1; r++) {
                    if (row + r < 0 || moduleCount <= row + r) continue;
                    
                    for (let c = -1; c <= 1; c++) {
                        if (col + c < 0 || moduleCount <= col + c) continue;
                        if (r == 0 && c == 0) continue;
                        if (dark == qrCode.isDark(row + r, col + c)) sameCount++;
                    }
                }

                if (sameCount > 5) lostPoint += (3 + sameCount - 5);
            }
        }

        // LEVEL2
        for (let row = 0; row < moduleCount - 1; row++) {
            for (let col = 0; col < moduleCount - 1; col++) {
                let count = 0;
                if (qrCode.isDark(row,     col    )) count++;
                if (qrCode.isDark(row + 1, col    )) count++;
                if (qrCode.isDark(row,     col + 1)) count++;
                if (qrCode.isDark(row + 1, col + 1)) count++;
                if (count == 0 || count == 4) lostPoint += 3;
            }
        }

        // LEVEL3
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount - 6; col++) {
                if (qrCode.isDark(row, col)
                    && !qrCode.isDark(row, col + 1)
                    &&  qrCode.isDark(row, col + 2)
                    &&  qrCode.isDark(row, col + 3)
                    &&  qrCode.isDark(row, col + 4)
                    && !qrCode.isDark(row, col + 5)
                    &&  qrCode.isDark(row, col + 6)
                ) {
                    lostPoint += 40;
                }
            }
        }

        for (let col = 0; col < moduleCount; col++) {
            for (let row = 0; row < moduleCount - 6; row++) {
                if (qrCode.isDark(row, col)
                    && !qrCode.isDark(row + 1, col)
                    &&  qrCode.isDark(row + 2, col)
                    &&  qrCode.isDark(row + 3, col)
                    &&  qrCode.isDark(row + 4, col)
                    && !qrCode.isDark(row + 5, col)
                    &&  qrCode.isDark(row + 6, col)
                ) {
                    lostPoint += 40;
                }
            }
        }

        // LEVEL4
        let darkCount = 0;
        for (let col = 0; col < moduleCount; col++) {
            for (let row = 0; row < moduleCount; row++) {
                if (qrCode.isDark(row, col)) darkCount++;
            }
        }

        let ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;

        return lostPoint;		
    }
};

module.exports = QRUtil;