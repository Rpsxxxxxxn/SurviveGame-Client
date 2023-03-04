import BinaryWriter from "../common/BinaryWriter";

export default class GamePlay {
    constructor(name) {
        this.name = name;
        this.writer = new BinaryWriter(true);
    }

    getPacket() {
        this.writer.setUint8(0x00);
        this.writer.setString(this.name);
        return this.writer.build();
    }
}