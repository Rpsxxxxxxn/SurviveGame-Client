export default class ImageManager {
    constructor() {
        this.images = new Map();
    }

    /**
     * 画像の追加
     * @param {*} url 
     * @param {*} tag 
     * @returns 
     */
    async addImage(url, tag) {
        if (this.images.has(tag)) {
            console.warn(`Image with tag ${tag} already exists`);
            return;
        }
        const promise = new Promise(resolve => {
            const image = new Image();
            image.onload = () => {
                resolve(image);
            }
            image.src = url;
        }).then(image => {
            this.images.set(tag, image);
            console.log(`Image with tag ${tag} loaded`);
        });
        await promise;
    }

    /**
     * 画像の削除
     * @param {*} tag 
     */
    removeImage(tag) {
        this.images.delete(tag);
    }

    /**
     * 画像の取得
     * @param {*} tag 
     * @returns 
     */
    getImage(tag) {
        return this.images.get(tag);
    }

    /**
     * 画像が存在するか
     * @param {*} tag 
     * @returns 
     */
    hasImage(tag) {
        return this.images.has(tag);
    }
}