export default class AnimImage {
    constructor(image, x, y, size, drawSize, frameCount, frameDuration, loop = false) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.size = size;
        this.drawSize = drawSize;
        this.frameCount = frameCount;
        this.frameDuration = frameDuration;
        this.loop = loop;
        this.frame = 0;
        this.frameTime = 0;
        this.startDate = Date.now();
    }

    update() {
        this.frameTime += this.getElapsedTime();
        if (this.frameTime > this.frameDuration) {
            this.frameTime = 0;
            this.frame++;
            if (this.frame >= this.frameCount) {
                if (this.loop) {
                    this.frame = 0;
                } else {
                    this.frame = this.frameCount - 1;
                }
            }
        }
        console.log(this.frameTime)
    }

    draw(ctx) {
        const sx = this.frame * this.size;
        const sy = 0;
        const sw = this.size;
        const sh = this.size;
        const dx = this.x;
        const dy = this.y;
        const dw = this.drawSize;
        const dh = this.drawSize;
        ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    isDelete() {
        return !this.loop && this.frame >= this.frameCount - 1;
    }

    getElapsedTime() {
        const elapsed = Date.now() - this.startDate;
        this.startDate = Date.now();
        return elapsed;
    }
}