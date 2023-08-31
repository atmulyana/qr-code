//https://github.com/atmulyana/qr-code
//@flow strict-local
import typeof ECL from './ErrorCorrectionLevel';
import type {Byte, Value, Version} from './types';
const {Data} = require('./types');
const getDataBuffer = require('./data');
const RSBlock = require('./RSBlock');
const BitBuffer = require('./BitBuffer');
const util = require('./util');
const Polynomial = require('./Polynomial');

type Mask = {
    func: (number, number) => boolean,
    pattern: Byte,
};

const PAD = 0xEC11;

function getRSBlockTotalDataCount(rsBlocks: Array<RSBlock>): number {
    return rsBlocks.reduce((count, rsBlock) => count + rsBlock.dataCount, 0);
}

class QRCode {
    #version: Version;
    #errorCorrectionLevel: $Values<ECL>;
    #modules: Array<Array<boolean | void>> = [];
    #dataList: Array<Data> = [];
    #dataCache: ?Uint8Array = null;

    constructor(version: Version, errorCorrectionLevel: $Values<ECL>) {
        this.#version = version;
        this.#errorCorrectionLevel = errorCorrectionLevel;
    }

    addData(data: string | Uint8Array | Array<Byte> | Value | Data): void {
        let newData: Data
        if (data instanceof Data)
            newData = data;
        else {
            const newData2 = getDataBuffer(data);
            if (newData2 == null) {
                throw new TypeError("Unsupported data type");
            }
            else {
                newData = newData2;
            }
        }
        this.#dataList.push(newData);
        this.#dataCache = null;
    }

    isDark(row: number, col: number): boolean {
        if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
            throw new Error("Index is out of range:" + row + "," + col);
        }
        return this.#modules[row][col] || false;
    }

    get moduleCount(): number {
        return this.#modules.length;
    }

    get modules(): Array<Array<boolean | void>> {
        return this.#modules;
    }

    make() {
        // Calculate automatically version if provided is < 1
        if (this.#version < 1) {
            let version = 1;
            for (version = 1; version < 40; version++) {
                const rsBlocks = RSBlock.getRSBlocks(version, this.#errorCorrectionLevel);
                
                let totalDataCount = getRSBlockTotalDataCount(rsBlocks);
                totalDataCount = totalDataCount << 3; //bits count == totalDataCount * 8

                let bitsCount = 0;
                for (let i = 0; i < this.#dataList.length; i++) {
                    const data = this.#dataList[i];
                    bitsCount += 4; //mode
                    bitsCount += util.getLengthInBits(data.mode, version);
                    bitsCount += data.bitsLength;
                }
                if (bitsCount <= totalDataCount) break;
            }
            this.#version = version;
        }
        this.#makeImpl(false, this.bestMaskPattern);
    }

    //We prefer to create a private method as a property to avoid more setting for babel
    #makeImpl = (test: boolean, mask: Mask) => {
        const moduleCount = this.#version * 4 + 17;
        this.#modules = new Array<Array<boolean| void>>(moduleCount);
        for (let row = 0; row < moduleCount; row++) {
            this.#modules[row] = new Array(moduleCount);
        }

        this.#setupPositionProbePattern(0, 0);
        this.#setupPositionProbePattern(moduleCount - 7, 0);
        this.#setupPositionProbePattern(0, moduleCount - 7);
        this.#setupPositionAdjustPattern();
        this.#setupTimingPattern();
        this.#setupTypeInfo(test, mask);

        if (this.#version >= 7) {
            this.#setupVersion(test);
        }

        if (this.#dataCache == null) {
            this.#dataCache = QRCode.createData(this.#version, this.#errorCorrectionLevel, this.#dataList);
        }

        this.#mapData(mask);
    }

    get bestMaskPattern(): Mask {
        let minLostPoint = 0;
        let mask: Mask;

        for (let i = 0; i < 8; i++) {
            const testMask = {
                pattern: i,
                func: util.getMaskFunction(i)
            };
            this.#makeImpl(true, testMask);
            const lostPoint = util.getLostPoint(this);
            if (i == 0 || minLostPoint > lostPoint) {
                minLostPoint = lostPoint;
                mask = testMask;
            }
        }

        //$FlowIgnore[incompatible-return] It must have been initialized
        return mask;
    }

    #setupPositionProbePattern = (row: number, col: number) => {
        const moduleCount = this.moduleCount;
        for (let r = -1; r <= 7; r++) {
            if (row + r <= -1 || moduleCount <= row + r) continue;

            for (let c = -1; c <= 7; c++) {
                if (col + c <= -1 || moduleCount <= col + c) continue;
                
                if (
                       (0 <= r && r <= 6 && (c == 0 || c == 6))
                    || (0 <= c && c <= 6 && (r == 0 || r == 6))
                    || (2 <= r && r <= 4 && 2 <= c && c <= 4)
                ) {
                    this.#modules[row + r][col + c] = true;
                } else {
                    this.#modules[row + r][col + c] = false;
                }
            }
        }		
    }

    #setupTimingPattern = () => {
        const max = this.moduleCount - 8;

        for (let r = 8; r < max; r++) {
            if (this.#modules[r][6] !== undefined) continue;
            this.#modules[r][6] = (r & 1) == 0; //r % 2 == 0
        }

        for (let c = 8; c < max; c++) {
            if (this.#modules[6][c] !== undefined) continue;
            this.#modules[6][c] = (c & 1) == 0; //c % 2 == 0
        }
    }

    #setupPositionAdjustPattern = () => {
        const pos = util.getPatternPosition(this.#version);

        for (let i = 0; i < pos.length; i++) {
            for (let j = 0; j < pos.length; j++) {
                const row = pos[i],
                      col = pos[j];

                if (this.#modules[row][col] !== undefined) continue;
                
                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
                            this.#modules[row + r][col + c] = true;
                        } else {
                            this.#modules[row + r][col + c] = false;
                        }
                    }
                }
            }
        }
    }

    #setupVersion = (test: boolean) => {
        const bits = util.getBCHVersion(this.#version);
        const offset = this.moduleCount - 8 - 3;

        for (let i = 0; i < 18; i++) {
            const mod = (!test && ((bits >> i) & 1) == 1),
                  i1 = Math.floor(i / 3),
                  i2 = i % 3 + offset;
            this.#modules[i1][i2] = mod;
            this.#modules[i2][i1] = mod;
        }
    }

    #setupTypeInfo = (test: boolean, mask: Mask) => {
        const data = (this.#errorCorrectionLevel << 3) | mask.pattern,
              bits = util.getBCHTypeInfo(data),
              moduleCount = this.moduleCount;

        // vertical		
        for (let i = 0; i < 15; i++) {
            const mod = (!test && ((bits >> i) & 1) == 1);
            if (i < 6) {
                this.#modules[i][8] = mod;
            } else if (i < 8) {
                this.#modules[i + 1][8] = mod;
            } else {
                this.#modules[moduleCount - 15 + i][8] = mod;
            }
        }

        // horizontal
        for (let i = 0; i < 15; i++) {
            const mod = (!test && ((bits >> i) & 1) == 1);
            if (i < 8) {
                this.#modules[8][moduleCount - i - 1] = mod;
            } else if (i < 9) {
                this.#modules[8][15 - i - 1 + 1] = mod;
            } else {
                this.#modules[8][15 - i - 1] = mod;
            }
        }

        // fixed module
        this.#modules[moduleCount - 8][8] = (!test);
    }

    #mapData = (mask: Mask) => {
        const data = this.#dataCache || new Uint8Array(0),
              moduleCount = this.moduleCount;
        let inc = -1,
            row = moduleCount - 1,
            bitIndex = 7,
            byteIndex = 0;

        for (let col = moduleCount - 1; col > 0; col -= 2) {
            if (col == 6) col--;

            while (true) {
                for (let c = 0; c < 2; c++) {
                    if (this.#modules[row][col - c] === undefined) {
                        let dark = false;
                        if (byteIndex < data.length) {
                            dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
                        }

                        if (mask.func(row, col - c)) {
                            dark = !dark;
                        }

                        this.#modules[row][col - c] = dark;
                        bitIndex--;

                        if (bitIndex == -1) {
                            byteIndex++;
                            bitIndex = 7;
                        }
                    }
                }

                row += inc;

                if (row < 0 || moduleCount <= row) {
                    row -= inc;
                    inc = -inc;
                    break;
                }
            }
        }
    }

    static createData(version: Version, errorCorrectionLevel: $Values<ECL>, dataList: Array<Data>): Uint8Array {
        const rsBlocks = RSBlock.getRSBlocks(version, errorCorrectionLevel);
        let totalDataCount = getRSBlockTotalDataCount(rsBlocks);
        const buffer = new BitBuffer(totalDataCount);
        totalDataCount <<= 3; //totalDataCount *= 8

        for (let i = 0; i < dataList.length; i++) {
            const data = dataList[i];
            buffer.put(data.mode, 4);
            buffer.put(data.length, util.getLengthInBits(data.mode, version) );
            data.write(buffer);
        }

        // end code
        if (buffer.length + 4 <= totalDataCount) {
            buffer.put(0, 4);
        }

        // padding
        let x = buffer.length & 0x07; // buffer.length % 8
        if (x) {
            buffer.put(0, 8 - x);
        }
        
        // padding
        let y = totalDataCount - buffer.length;
        x = y >>> 4; // Math.floor(y / 16)
        for (let i = 0; i < x; i++) {
            buffer.put(PAD, 16);
        }
        if (y & 0x0f) { //y % 16 != 0 
            buffer.put(PAD >>> 8, 8);
        }

        return QRCode.createBytes(buffer, rsBlocks);
    }

    static createBytes(buffer: BitBuffer, rsBlocks: Array<RSBlock>): Uint8Array {
        let offset = 0,
            maxDcCount = 0,
            maxEcCount = 0;
        const dcdata = new Array<Uint8Array>(rsBlocks.length),
              ecdata = new Array<Uint8Array>(rsBlocks.length);

        for (let r = 0; r < rsBlocks.length; r++) {
            const dcCount = rsBlocks[r].dataCount;
            const ecCount = rsBlocks[r].totalCount - dcCount;

            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);

            dcdata[r] = new Uint8Array(dcCount);
            for (let i = 0; i < dcdata[r].length; i++) {
                dcdata[r][i] = buffer.getByte(i + offset);
            }
            offset += dcCount;

            const rsPoly = util.getErrorCorrectPolynomial(ecCount);
            const rawPoly = new Polynomial(dcdata[r], rsPoly.length - 1);
            const modPoly = rawPoly.mod(rsPoly);
            
            ecdata[r] = new Uint8Array(rsPoly.length - 1);
            for (let i = 0; i < ecdata[r].length; i++) {
                const modIndex = i + modPoly.length - ecdata[r].length;
                ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
            }
        }

        const totalCodeCount = rsBlocks.reduce((count, rsBlock) => count + rsBlock.totalCount, 0);
        const data = new Uint8Array(totalCodeCount);
        let index = 0;

        for (let i = 0; i < maxDcCount; i++) {
            for (let r = 0; r < rsBlocks.length; r++) {
                if (i < dcdata[r].length) {
                    data[index++] = dcdata[r][i];
                }
            }
        }

        for (let i = 0; i < maxEcCount; i++) {
            for (let r = 0; r < rsBlocks.length; r++) {
                if (i < ecdata[r].length) {
                    data[index++] = ecdata[r][i];
                }
            }
        }

        return data;
    }
}

module.exports = QRCode;

