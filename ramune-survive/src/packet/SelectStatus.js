import BinaryWriter from "../common/BinaryWriter";

export default class SelectStatus {
    constructor(id) {
        this.id = id;
        this.writer = new BinaryWriter(true);
    }

    getPacket() {
        this.writer.setUint8(0x03);
        this.writer.setUint8(this.id);
        return this.writer.build();
    }
}