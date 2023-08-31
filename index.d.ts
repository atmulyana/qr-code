//https://github.com/atmulyana/qr-code

export type ErrorCorrectionLevel = {
    L: 1,
    M: 0,
    Q: 3,
    H: 2
};

export type Mode = {
    Numeric:		1,
    AlphaNumeric: 	2,
    Byte: 	        4,
    Kanji:		    8
};

export type Byte = number; //It should be range<0..255>
export type Version = number; //It should be range<1..40> or -1

export type Value = {
    data: any,
    mode: Mode,
};

declare class BitBuffer {
    get length(): number;
    get(index: number): boolean;
    getByte(index: number): Byte;
    put(num: number, length: number): void;
    putBit(bit: boolean): void;
}

declare class Data {
    get bitsLength(): number;
    get length(): number;
    get mode(): Mode[keyof Mode];
    write(buffer: BitBuffer): void;
}

declare class QRCode {
    addData(data: string | Uint8Array | Array<Byte> | Value | Data): void;
    isDark(row: number, col: number): boolean;
    make(): void;
    get moduleCount(): number;
    get modules(): Array<Array<boolean>>;
}

export type QRCodeOption = {
    errorCorrectionLevel?: ErrorCorrectionLevel[keyof ErrorCorrectionLevel],
	version?: Version,
};

declare function qrcode(
    data: string | Uint8Array | Array<Byte> | Value | Data,
	opt?: QRCodeOption
): QRCode;

export default qrcode;

type TData = typeof Data;
declare namespace qrcode {
    export const Data: TData;
    export const ErrorCorrectionLevel: ErrorCorrectionLevel;
    export const Mode: Mode;
}