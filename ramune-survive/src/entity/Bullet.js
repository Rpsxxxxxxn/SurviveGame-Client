import Vector2 from "../common/Vector2";

export default class Bullet {
    constructor(x, y, size) {
        this.position = new Vector2(x, y);
        this.oldPosition = new Vector2(x, y);
        this.newPosition = new Vector2(x, y);
        this.size = size;
    }
}