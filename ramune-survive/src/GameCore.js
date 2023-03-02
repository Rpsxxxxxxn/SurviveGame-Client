export default class GameCore {
    constructor() {

    }

    init() {
    }

    update() {
        
        requestAnimationFrame(this.update.bind(this));
    }
}