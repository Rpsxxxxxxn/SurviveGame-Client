import BinaryWriter from "../common/BinaryWriter";

export default class Spectate {
    constructor(id) {
        this.id = id;
        this.writer = new BinaryWriter(true);
    }

    getPacket() {
        this.writer.setUint8(0x01);
        return this.writer.build();
    }
}