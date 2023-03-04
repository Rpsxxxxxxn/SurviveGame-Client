import BinaryWriter from "../common/BinaryWriter";

export default class AddChat {
    constructor(message) {
        this.message = message;
        this.writer = new BinaryWriter(true);
    }

    getPacket() {
        this.writer.setUint8(100);
        this.writer.setString(this.message);
        return this.writer.build();
    }
}