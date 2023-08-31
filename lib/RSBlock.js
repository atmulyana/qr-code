//https://github.com/atmulyana/qr-code
//@flow strict-local
import type {Version} from './types';
const ECL = require('./ErrorCorrectionLevel');

const rsBlockTable: Array<Uint8Array> = [

    // L
    // M
    // Q
    // H
    
    // 1
    Uint8Array.from([1, 26, 19]),
    Uint8Array.from([1, 26, 16]),
    Uint8Array.from([1, 26, 13]),
    Uint8Array.from([1, 26, 9]),
    
    // 2
    Uint8Array.from([1, 44, 34]),
    Uint8Array.from([1, 44, 28]),
    Uint8Array.from([1, 44, 22]),
    Uint8Array.from([1, 44, 16]),
    
    // 3
    Uint8Array.from([1, 70, 55]),
    Uint8Array.from([1, 70, 44]),
    Uint8Array.from([2, 35, 17]),
    Uint8Array.from([2, 35, 13]),
    
    // 4		
    Uint8Array.from([1, 100, 80]),
    Uint8Array.from([2, 50, 32]),
    Uint8Array.from([2, 50, 24]),
    Uint8Array.from([4, 25, 9]),
    
    // 5
    Uint8Array.from([1, 134, 108]),
    Uint8Array.from([2, 67, 43]),
    Uint8Array.from([2, 33, 15, 2, 34, 16]),
    Uint8Array.from([2, 33, 11, 2, 34, 12]),
    
    // 6
    Uint8Array.from([2, 86, 68]),
    Uint8Array.from([4, 43, 27]),
    Uint8Array.from([4, 43, 19]),
    Uint8Array.from([4, 43, 15]),
    
    // 7		
    Uint8Array.from([2, 98, 78]),
    Uint8Array.from([4, 49, 31]),
    Uint8Array.from([2, 32, 14, 4, 33, 15]),
    Uint8Array.from([4, 39, 13, 1, 40, 14]),
    
    // 8
    Uint8Array.from([2, 121, 97]),
    Uint8Array.from([2, 60, 38, 2, 61, 39]),
    Uint8Array.from([4, 40, 18, 2, 41, 19]),
    Uint8Array.from([4, 40, 14, 2, 41, 15]),
    
    // 9
    Uint8Array.from([2, 146, 116]),
    Uint8Array.from([3, 58, 36, 2, 59, 37]),
    Uint8Array.from([4, 36, 16, 4, 37, 17]),
    Uint8Array.from([4, 36, 12, 4, 37, 13]),
    
    // 10		
    Uint8Array.from([2, 86, 68, 2, 87, 69]),
    Uint8Array.from([4, 69, 43, 1, 70, 44]),
    Uint8Array.from([6, 43, 19, 2, 44, 20]),
    Uint8Array.from([6, 43, 15, 2, 44, 16]),
    
    // 11
    Uint8Array.from([4, 101, 81]),
    Uint8Array.from([1, 80, 50, 4, 81, 51]),
    Uint8Array.from([4, 50, 22, 4, 51, 23]),
    Uint8Array.from([3, 36, 12, 8, 37, 13]),
    
    // 12
    Uint8Array.from([2, 116, 92, 2, 117, 93]),
    Uint8Array.from([6, 58, 36, 2, 59, 37]),
    Uint8Array.from([4, 46, 20, 6, 47, 21]),
    Uint8Array.from([7, 42, 14, 4, 43, 15]),
    
    // 13
    Uint8Array.from([4, 133, 107]),
    Uint8Array.from([8, 59, 37, 1, 60, 38]),
    Uint8Array.from([8, 44, 20, 4, 45, 21]),
    Uint8Array.from([12, 33, 11, 4, 34, 12]),
    
    // 14
    Uint8Array.from([3, 145, 115, 1, 146, 116]),
    Uint8Array.from([4, 64, 40, 5, 65, 41]),
    Uint8Array.from([11, 36, 16, 5, 37, 17]),
    Uint8Array.from([11, 36, 12, 5, 37, 13]),
    
    // 15
    Uint8Array.from([5, 109, 87, 1, 110, 88]),
    Uint8Array.from([5, 65, 41, 5, 66, 42]),
    Uint8Array.from([5, 54, 24, 7, 55, 25]),
    Uint8Array.from([11, 36, 12]),
    
    // 16
    Uint8Array.from([5, 122, 98, 1, 123, 99]),
    Uint8Array.from([7, 73, 45, 3, 74, 46]),
    Uint8Array.from([15, 43, 19, 2, 44, 20]),
    Uint8Array.from([3, 45, 15, 13, 46, 16]),
    
    // 17
    Uint8Array.from([1, 135, 107, 5, 136, 108]),
    Uint8Array.from([10, 74, 46, 1, 75, 47]),
    Uint8Array.from([1, 50, 22, 15, 51, 23]),
    Uint8Array.from([2, 42, 14, 17, 43, 15]),
    
    // 18
    Uint8Array.from([5, 150, 120, 1, 151, 121]),
    Uint8Array.from([9, 69, 43, 4, 70, 44]),
    Uint8Array.from([17, 50, 22, 1, 51, 23]),
    Uint8Array.from([2, 42, 14, 19, 43, 15]),
    
    // 19
    Uint8Array.from([3, 141, 113, 4, 142, 114]),
    Uint8Array.from([3, 70, 44, 11, 71, 45]),
    Uint8Array.from([17, 47, 21, 4, 48, 22]),
    Uint8Array.from([9, 39, 13, 16, 40, 14]),
    
    // 20
    Uint8Array.from([3, 135, 107, 5, 136, 108]),
    Uint8Array.from([3, 67, 41, 13, 68, 42]),
    Uint8Array.from([15, 54, 24, 5, 55, 25]),
    Uint8Array.from([15, 43, 15, 10, 44, 16]),
    
    // 21
    Uint8Array.from([4, 144, 116, 4, 145, 117]),
    Uint8Array.from([17, 68, 42]),
    Uint8Array.from([17, 50, 22, 6, 51, 23]),
    Uint8Array.from([19, 46, 16, 6, 47, 17]),
    
    // 22
    Uint8Array.from([2, 139, 111, 7, 140, 112]),
    Uint8Array.from([17, 74, 46]),
    Uint8Array.from([7, 54, 24, 16, 55, 25]),
    Uint8Array.from([34, 37, 13]),
    
    // 23
    Uint8Array.from([4, 151, 121, 5, 152, 122]),
    Uint8Array.from([4, 75, 47, 14, 76, 48]),
    Uint8Array.from([11, 54, 24, 14, 55, 25]),
    Uint8Array.from([16, 45, 15, 14, 46, 16]),
    
    // 24
    Uint8Array.from([6, 147, 117, 4, 148, 118]),
    Uint8Array.from([6, 73, 45, 14, 74, 46]),
    Uint8Array.from([11, 54, 24, 16, 55, 25]),
    Uint8Array.from([30, 46, 16, 2, 47, 17]),
    
    // 25
    Uint8Array.from([8, 132, 106, 4, 133, 107]),
    Uint8Array.from([8, 75, 47, 13, 76, 48]),
    Uint8Array.from([7, 54, 24, 22, 55, 25]),
    Uint8Array.from([22, 45, 15, 13, 46, 16]),
    
    // 26
    Uint8Array.from([10, 142, 114, 2, 143, 115]),
    Uint8Array.from([19, 74, 46, 4, 75, 47]),
    Uint8Array.from([28, 50, 22, 6, 51, 23]),
    Uint8Array.from([33, 46, 16, 4, 47, 17]),
    
    // 27
    Uint8Array.from([8, 152, 122, 4, 153, 123]),
    Uint8Array.from([22, 73, 45, 3, 74, 46]),
    Uint8Array.from([8, 53, 23, 26, 54, 24]),
    Uint8Array.from([12, 45, 15, 28, 46, 16]),
    
    // 28
    Uint8Array.from([3, 147, 117, 10, 148, 118]),
    Uint8Array.from([3, 73, 45, 23, 74, 46]),
    Uint8Array.from([4, 54, 24, 31, 55, 25]),
    Uint8Array.from([11, 45, 15, 31, 46, 16]),
    
    // 29
    Uint8Array.from([7, 146, 116, 7, 147, 117]),
    Uint8Array.from([21, 73, 45, 7, 74, 46]),
    Uint8Array.from([1, 53, 23, 37, 54, 24]),
    Uint8Array.from([19, 45, 15, 26, 46, 16]),
    
    // 30
    Uint8Array.from([5, 145, 115, 10, 146, 116]),
    Uint8Array.from([19, 75, 47, 10, 76, 48]),
    Uint8Array.from([15, 54, 24, 25, 55, 25]),
    Uint8Array.from([23, 45, 15, 25, 46, 16]),
    
    // 31
    Uint8Array.from([13, 145, 115, 3, 146, 116]),
    Uint8Array.from([2, 74, 46, 29, 75, 47]),
    Uint8Array.from([42, 54, 24, 1, 55, 25]),
    Uint8Array.from([23, 45, 15, 28, 46, 16]),
    
    // 32
    Uint8Array.from([17, 145, 115]),
    Uint8Array.from([10, 74, 46, 23, 75, 47]),
    Uint8Array.from([10, 54, 24, 35, 55, 25]),
    Uint8Array.from([19, 45, 15, 35, 46, 16]),
    
    // 33
    Uint8Array.from([17, 145, 115, 1, 146, 116]),
    Uint8Array.from([14, 74, 46, 21, 75, 47]),
    Uint8Array.from([29, 54, 24, 19, 55, 25]),
    Uint8Array.from([11, 45, 15, 46, 46, 16]),
    
    // 34
    Uint8Array.from([13, 145, 115, 6, 146, 116]),
    Uint8Array.from([14, 74, 46, 23, 75, 47]),
    Uint8Array.from([44, 54, 24, 7, 55, 25]),
    Uint8Array.from([59, 46, 16, 1, 47, 17]),
    
    // 35
    Uint8Array.from([12, 151, 121, 7, 152, 122]),
    Uint8Array.from([12, 75, 47, 26, 76, 48]),
    Uint8Array.from([39, 54, 24, 14, 55, 25]),
    Uint8Array.from([22, 45, 15, 41, 46, 16]),
    
    // 36
    Uint8Array.from([6, 151, 121, 14, 152, 122]),
    Uint8Array.from([6, 75, 47, 34, 76, 48]),
    Uint8Array.from([46, 54, 24, 10, 55, 25]),
    Uint8Array.from([2, 45, 15, 64, 46, 16]),
    
    // 37
    Uint8Array.from([17, 152, 122, 4, 153, 123]),
    Uint8Array.from([29, 74, 46, 14, 75, 47]),
    Uint8Array.from([49, 54, 24, 10, 55, 25]),
    Uint8Array.from([24, 45, 15, 46, 46, 16]),
    
    // 38
    Uint8Array.from([4, 152, 122, 18, 153, 123]),
    Uint8Array.from([13, 74, 46, 32, 75, 47]),
    Uint8Array.from([48, 54, 24, 14, 55, 25]),
    Uint8Array.from([42, 45, 15, 32, 46, 16]),
    
    // 39
    Uint8Array.from([20, 147, 117, 4, 148, 118]),
    Uint8Array.from([40, 75, 47, 7, 76, 48]),
    Uint8Array.from([43, 54, 24, 22, 55, 25]),
    Uint8Array.from([10, 45, 15, 67, 46, 16]),
    
    // 40
    Uint8Array.from([19, 148, 118, 6, 149, 119]),
    Uint8Array.from([18, 75, 47, 31, 76, 48]),
    Uint8Array.from([34, 54, 24, 34, 55, 25]),
    Uint8Array.from([20, 45, 15, 61, 46, 16]),
];

function getRsBlockTable(version: Version, errorCorrectionLevel: $Values<typeof ECL>): Uint8Array | void {
    switch(errorCorrectionLevel) {
        case ECL.L :
            return rsBlockTable[(version - 1) * 4 + 0];
        case ECL.M :
            return rsBlockTable[(version - 1) * 4 + 1];
        case ECL.Q :
            return rsBlockTable[(version - 1) * 4 + 2];
        case ECL.H :
            return rsBlockTable[(version - 1) * 4 + 3];
        default :
            return undefined;
    }
}

class QRRSBlock {
    #dataCount: number;
    #totalCount: number;

    constructor(totalCount: number, dataCount: number) {
        this.#totalCount = totalCount;
        this.#dataCount  = dataCount;
    }

    get dataCount(): number {
        return this.#dataCount;
    }

    get totalCount(): number {
        return this.#totalCount;
    }

    static getRSBlocks(version: Version, errorCorrectionLevel: $Values<typeof ECL>): Array<QRRSBlock> {
        const rsBlock = getRsBlockTable(version, errorCorrectionLevel);
        if (!rsBlock) {
            throw new Error(`bad value of version: ${version} or errorCorrectionLevel: ${errorCorrectionLevel}`);
        }

        const length = rsBlock.length / 3,
              list: Array<QRRSBlock> = [];

        for (let i = 0; i < length; i++) {
            const count = rsBlock[i * 3 + 0],
                  totalCount = rsBlock[i * 3 + 1],
                  dataCount  = rsBlock[i * 3 + 2];
            for (let j = 0; j < count; j++) {
                list.push(new QRRSBlock(totalCount, dataCount));	
            }
        }

        return list;
    }
}

module.exports = QRRSBlock;
