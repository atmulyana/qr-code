# **qrcode**

This package is a rewritten package of [`qr.js`](https://github.com/defunctzombie/qr.js) with some enhancements.
What we did in this package if compared to the original package:
- There are some code optimatizations to increase performance.
- It uses more recent Javascript features. We prefer to use an `Uint8Array` instead of an array of
  byte numbers to store the QR code data (less memory).
- `string` data is automatically converted to UTF-8 from UTF-16 (Javascript string encoding).
- Beside data buffer for binary data mode, it also provides for numeric, alpha-numeric and kanji mode.

## **Usage**
```javascript
const qr = require('@atmulyana/qr-code');

function drawSquare(x, y, size, color) {
    //The implementation depends on what you use
    //You may use web canvas, SVG etc.
    //...
}

const size = 128;
const cells = qr('https://en.wikipedia.org/wiki/QR_code').modules;
const cellSize = size / cells.length;
const bgColor = 'white';
const fgColor = 'black';

drawSquare(0, 0, size, bgColor); //draws the background
for (let y = 0; y < cells.length; y++) {
    for (let x = 0; x < cells.length; x++) {
        if (cells[y][x]) {
            drawSquare(
                x * cellSize,
                y * cellSize,
                cellSize,
                fgColor
            );
        }
    }
}
```

### **The parameters of `qr` function**
- The first parameter is the encoded data as shown in the usage example. Not only string that you can pass as the
  data to be encoded. The possible data types that  you can use as the first parameter:
  + `string`  
    The string will be converted from UTF-16 (Javascript string encoding) to UTF-8.
  + `Uint8Array` or array of byte numbers
  + Object `{mode, data}`  
    QR code has several data mode. It determines how the data is encoded. If you want to specify the data mode, you
    can use object data type whose two properties: `mode` and `data`. There are 4 possible values for `mode`:
    1 (numeric), 2 (alpha-numeric), 4 (byte/binary) and 8 (kanji). You can use the predefined constants:
    `qr.Mode.Numeric`, `qr.Mode.AlphaNumeric`, `qr.Mode.Byte` and `qr.Mode.Kanji`.   
    `data` property is the data to be encoded. It's a string or will be converted to a string for non string. For
    byte mode, there are the other acceptable data type beside string (read the detailed explanation for each mode).
    Each mode except binary mode has restriction for what data that can be encoded. An error happens if the
    restriction is violated. The data that can be encoded for each mode:
    * Numeric  
      Only numeric characters (0-9) that can be encoded.
    * Alpha-numeric   
      The allowed characters for this mode are `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`
    * Byte/Binary   
      This mode can encode all characters in the string. The string encoding will be converted from UTF-16 to UTF-8.
      Beside string, this mode can also accept `Uint8Array` or an array of byte numbers to be encoded. These arrays
      will be stored as is. If the first parameter of `qr` function is a string, `Uint8Array` or array of numbers then
      the used mode is binary.
    * Kanji   
      This mode to encode the words written in kanji (Japanese letters). The data string encoding will be converted
      from UTF-16 to Shift-JIS. An error happens if there is a non-kanji character in the string.
  + A data buffer object which is an instance of a class that extends `qr.Data` class.   
    This package has provided data buffer class for each data mode. However, if you don't satisfy or there is a bug,
    you can create your own data buffer class which must extends `qr.Data` class. It's also useful if there is a
    new data mode. You can read the source code of this package (under data directory) for the example of how to
    create a data buffer class.

- The second parameter is an object for QR code setting. This parameter is optional. The object has two properties:
  + `version`  
    The value of `vesion` is a number between 1 to 40. This setting is to determine the size of QR code. If not defined,
    the size will be chosen the smallest size that can accommodate the data size. If you set a `version` value whose
    too small capacity to store the encoded data, an error will happen
  + `errorCorrectionLevel`   
    As its name, this setting is to set the level of how many data that can be restored if QR code is damage or cannot be
    scanned correctly. There are 4 levels and you can use the predefined constants:
    * `qr.ErrorCorrectionLevel.L` is low level
    * `qr.ErrorCorrectionLevel.M` is medium level
    * `qr.ErrorCorrectionLevel.Q` is quartile level
    * `qr.ErrorCorrectionLevel.H` is high level
    
    If not defined, the default value is high level.

## **Credit**
- [`qr.js`](https://github.com/defunctzombie/qr.js) package (the rewritten package)
- [QR Code reference](https://en.wikipedia.org/wiki/QR_code) at wikipedia
- [QR Code data encoding](https://www.thonky.com/qr-code-tutorial/data-encoding#step-3-encode-using-the-selected-mode)
- [UTF-16 to UTF-8 converter](https://medium.com/@vincentcorbee/utf-16-to-utf-8-in-javascript-18b4b11b6e1e)
- [utf16-to-sjis](https://github.com/okaxaki/utf16-to-sjis) package (UTF-16 to Shift-JIS converter)