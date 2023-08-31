//https://github.com/atmulyana/qr-code
//@flow strict-local
import type {Byte, Value, Version} from './types';
const {Data} = require('./types');
const ErrorCorrectionLevel = require('./ErrorCorrectionLevel');
const Mode = require('./mode');
const QRCode = require('./QRCode');

export type {Byte, Value, Version};

export type QRCodeOption = {
	errorCorrectionLevel?: $Values<typeof ErrorCorrectionLevel>,
	version?: Version,
};

function qrcode(
	data: string | Uint8Array | Array<Byte> | Value | Data,
	opt?: QRCodeOption
): QRCode {
	const options = opt || {};
	const qr = new QRCode(
		options.version || -1,
		options.errorCorrectionLevel || ErrorCorrectionLevel.H
	);
	qr.addData(data);
	qr.make();
	return qr;
};

qrcode.Data = Data;
qrcode.ErrorCorrectionLevel = ErrorCorrectionLevel;
qrcode.Mode = Mode;

module.exports = qrcode;