import Vector2 from "../common/Vector2";

export default class Bullet {
    constructor(id, x, y, size) {
        this.id = id;
        this.position = new Vector2(x, y);
        this.oldPosition = new Vector2(x, y);
        this.newPosition = new Vector2(x, y);
        this.size = size;
    }
}