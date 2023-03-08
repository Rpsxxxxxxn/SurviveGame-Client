import Vector2 from "../common/Vector2";
import Utils from "../common/Utils";

export default class DamageText {
    constructor(x, y, damage, r, g, b) {
        this.position = new Vector2(x, y);
        this.oldPosition = new Vector2(x, y);
        this.newPosition = new Vector2(x, y);
        this.damage = damage;
        this.color = Utils.rgbToString(r, g, b);
        this.startDate = Date.now();
        this.velocity = .5;
    }

    draw(ctx) {
        ctx.save()
        const elapsedTime = this.getElapsedTime();
        ctx.globalAlpha = 1 - elapsedTime / 500;
        ctx.fillStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.textAlign = "center";
        ctx.font = "30px 'Saira'";
        ctx.strokeText(String(this.damage), this.position.x - 24, this.position.y - 24);
        ctx.fillText(String(this.damage), this.position.x - 24, this.position.y - 24);
        this.position.y -= (100 / elapsedTime);
        ctx.restore();
    }

    isDelete() {
        return 1 - (this.getElapsedTime() / 500) < 0.1;
    }

    getElapsedTime() {
        return Date.now() - this.startDate;
    }
}