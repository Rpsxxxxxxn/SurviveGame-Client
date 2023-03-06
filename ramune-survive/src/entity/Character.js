import Vector2 from "../common/Vector2";

export default class Character {
    constructor(id, type, x, y) {
        this.id = id;
        this.type = type;
        this.position = new Vector2(x, y);
        this.oldPosition = new Vector2(x, y);
        this.newPosition = new Vector2(x, y);
    }
}