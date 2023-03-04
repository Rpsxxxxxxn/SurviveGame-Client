export default class Character {
    constructor(id, name, hp, str, dex, int, luk) {
        this.id = id;
        this.name = name;
        this.hp = hp;
        this.str = str;
        this.dex = dex;
        this.int = int;
        this.luk = luk;
    }

    get Id() {
        return this.id;
    }

    get Name() {
        return this.name;
    }

    get Hp() {
        return this.hp;
    }

    get Str() {
        return this.str;
    }

    get Dex() {
        return this.dex;
    }

    get Int() {
        return this.int;
    }

    get Luk() {
        return this.luk;
    }
}