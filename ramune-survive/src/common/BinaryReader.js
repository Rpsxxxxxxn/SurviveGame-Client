export default class BinaryReader {
    constructor(view, offset, littleEndian) {
        this.view = view;
        this.offset = offset || 0;
        this.endian = littleEndian;
    }

    getInt8() {
        return this.view.getInt8(this.offset++, this.endian);
    }

    getInt16() {
        const result = this.view.getInt16(this.offset, this.endian);
        this.skipBytes(2);
        return result;
    }

    getInt24() {
        const result = this.view.getInt16(this.offset, this.endian);
        this.skipBytes(3);
        return result;
    }

    getInt32() {
        const result = this.view.getInt32(this.offset, this.endian);
        this.skipBytes(4);
        return result;
    }

    getUint8() {
        return this.view.getUint8(this.offset++, this.endian);
    }

    getUint16() {
        const result = this.view.getUint16(this.offset, this.endian);
        this.skipBytes(2);
        return result;
    }

    getUint24() {
        const result = this.view.getUint16(this.offset, this.endian);
        this.skipBytes(3);
        return result;
    }

    getUint32() {
        const result = this.view.getUint32(this.offset, this.endian);
        this.skipBytes(4);
        return result;
    }

    getFloat() {
        const result = this.view.getFloat32(this.offset, this.endian);
        this.skipBytes(4);
        return result;
    }

    getDouble() {
        const result = this.view.getFloat64(this.offset, this.endian);
        this.skipBytes(8);
        return result;
    }

    /**
     * 文字列を取得する
     * @returns 
     */
	getString() {
		let [length, name] = [this.getUint16(), ""];
        for (let i = 0; i < length; i++) {
            name += String.fromCharCode(this.getUint16());
        }
        return name;
	}

    /**
     * UTF-8 string
     * @returns 
     */
    getUTF8String() {
        let [length, value] = [this.getUint8(), ""];
        for (let i = 0; i < length; i++) {
            value += this.getUint8();
        }
        return new TextDecoder("utf-8").decode(value);
    }

    /**
     * バイトをスキップする
     * @param {*} length 
     */
    skipBytes(length) {
        this.offset += length;
    }
}
