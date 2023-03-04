import BinaryWriter from "../common/BinaryWriter";

export default class Move {
    constructor(direction) {
        this.direction = direction;
        this.writer = new BinaryWriter(true);
    }

    getPacket() {
        this.writer.setUint8(0x02);
        this.writer.setUint8(this.direction);
        return this.writer.build();
    }
}