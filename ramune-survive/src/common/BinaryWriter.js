export default class BinaryWriter {
    constructor(littleEndian) {
        this.buffer = new DataView(new ArrayBuffer(8));
        this.endian = littleEndian;
        this.reset();
    }

    setUint8(a) {
        if (a >= 0 && a < 256) {
            this.view.push(a);
        }
    }

    setInt8(a) {
        if (a >= -128 && a < 128) {
            this.view.push(a);
        }
    }

    setUint16(a) {
        this.buffer.setUint16(0, a, this.endian);
        this.skipBytes(2);
    }

    setInt16(a) {
        this.buffer.setInt16(0, a, this.endian);
        this.skipBytes(2);
    }

    setUint32(a) {
        this.buffer.setUint32(0, a, this.endian);
        this.skipBytes(4);
    }

    setInt32(a) {
        this.buffer.setInt32(0, a, this.endian);
        this.skipBytes(4);
    }

    setFloat(a) {
        this.buffer.setFloat32(0, a, this.endian);
        this.skipBytes(4);
    }

    setDouble(a) {
        this.buffer.setFloat64(0, a, this.endian);
        this.skipBytes(8);
    }

    /**
     * バイトをスキップする
     * @param {*} a 
     */
    skipBytes(a) {
        for (let i = 0; i < a; i++) {
            this.view.push(this.buffer.getUint8(i));
        }
    }

    /**
     * 文字列をセットする
     * @param {*} s 
     */
    setString(value) {
        this.setUint16(value.length);
        for (let i = 0; i < value.length; i++) {
            this.setUint16(value.charCodeAt(i));
        }
    }

    /**
     * UTF-8の文字列をセットする
     * @param {*} s 
     */
    setUTF8String(s) {
        let bytes = new TextEncoder("utf-8").encode(s);
        this.setUint8(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            this.setUint8(bytes[i]);
        }
    }

    build() {
        return new Uint8Array(this.view);
    }

    reset() {
        this.view = [];
        this.offset = 0;
    }
}