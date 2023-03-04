export default class Utils {

    /**
     * RGBを文字列16進数に変更
     * @param {*} r 
     * @param {*} g 
     * @param {*} b 
     * @returns 
     */
    static rgbToString(r, g, b) {
        let color = Number(r << 16 | g << 8 | b).toString(16);
        return '#' + String(color).padStart(6, '0');
    }

    /**
     * rgbを10進数に変換
     * @param {*} r 
     * @param {*} g 
     * @param {*} b 
     * @returns 
     */
    static rgbToColor(r, g, b) {
        return (r << 16 | g << 8 | b);
    }

    static rgbColorToString(color) {
        let r = (color >> 16) & 0xFF;
        let g = (color >> 8) & 0xFF;
        let b = color & 0xFF;
        return Utils.rgbToString(r, g, b);
    }

    static ObjectIsNotNull(obj) {
        return obj !== null && obj !== undefined;
    }

    static isNumber(str) {
        return !isNaN(str);
    }

    static isInteger(str) {
        return !isNaN(str) && str % 1 === 0;
    }

    static isFloat(str) {
        return !isNaN(str) && str % 1 !== 0;
    }

    static isBoolean(str) {
        return str === "true" || str === "false";
    }

    static isEmail(str) {
        const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
        return regex.test(str);
    }

    /**
     * 
     * @param {*} color 
     * @returns 
     */
    static colorToRgb(color) {
        return {
            r: (color >> 16) & 0xFF,
            g: (color >> 8) & 0xFF,
            b: color & 0xFF,
        }
    }

    /**
     * 
     * @param {*} color 
     * @returns 
     */
    static colorToHex(color) {
        return '#' + String(color).padStart(6, '0');
    }

    /**
     * 
     * @param {*} hex 
     * @returns 
     */
    static hexToRgb(hex) {
        let r = parseInt(hex.substr(1, 2), 16);
        let g = parseInt(hex.substr(3, 2), 16);
        let b = parseInt(hex.substr(5, 2), 16);
        return { r, g, b };
    }

    /**
     * 
     * @param {*} hex 
     * @returns 
     */
    static hexToColor(hex) {
        let r = parseInt(hex.substr(1, 2), 16);
        let g = parseInt(hex.substr(3, 2), 16);
        let b = parseInt(hex.substr(5, 2), 16);
        return (r << 16 | g << 8 | b);
    }

    /**
     * 安全な解放
     * @param {*} object 
     */
    static safeRelease(object) {
        if (object) {
            object.destroy();
        }
    }

    /**
     * 配列からデータを探す
     * @param {*} list 
     * @returns 
     */
    static findElement(src, sub) {
        return src.filter((data) => { return !sub.includes(data) });
    }

    /**
     * 配列からデータを削除
     * @param {*} array 
     * @param {*} value 
     * @returns 
     */
    static arrayRemove(array, value) {
        return array.filter((element) => {
            return element !== value;
        });
    }

    /**
     * 
     * @param {*} value 
     * @param {*} showDigit 
     * @returns 
     */
    static shortUnitText(value, showDigit) {
        const shortTextChar = ['', 'k', 'm', 'g', 't'];
        let textValue = value;
        let digit = 0;
        while (textValue > 1000) {
            textValue /= 1000;
            digit++;
        }
        return (~~(textValue * showDigit) / showDigit) + shortTextChar[digit];
    }

    static checkTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints;
    }

    /**
     * キーコードを文字列に変換
     * @param {*} keyCode 
     * @returns 
     */
    static keyCodeToString(keyCode) {
        let keyChar = String.fromCharCode(keyCode);
        switch (keyCode) {
            case 9:
                keyChar = 'TAB';
                break;
            case 13:
                keyChar = 'ENTER';
                break;
            case 16:
                keyChar = 'SHIFT';
                break;
            case 27:
                keyChar = 'ESC';
                break;
            case 32:
                keyChar = 'SPACE';
                break;
            case 37:
                keyChar = 'LEFT';
                break;
            case 38:
                keyChar = 'UP';
                break;
            case 39:
                keyChar = 'RIGHT';
                break;
            case 40:
                keyChar = 'DOWN';
                break;
            case 46:
                keyChar = 'DELETE';
                break;
        }
        return keyChar;
    }

    static setLocalStorage(key, value) {
        if ("string" == typeof value) {
            localStorage.setItem(key, value);
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    };
    
    static getLocalStorage(storageKey) {
        return localStorage.getItem(storageKey);
    };
    
    static removeLocalStorage(storageKey) {
        return localStorage.removeItem(storageKey);
    }
}