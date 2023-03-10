import $ from 'jquery';
import AddChat from '../packet/AddChat.js';
import Utils from './Utils.js';

export default class Hotkey {
    constructor(gameCore) {
        this.gameCore = gameCore;
        this.selectedHotkeyRow = null;
        this.keyBind = {};
        this.mouseBind = {};
        this.config = {
            hkUp: {
                defaultHotkey: 'W',
                defaultMouseKey: '',
                name: '上移動',
                keyDown: function() {
                    this.gameCore.sendMoveUp();
                }.bind(this),
                keyUp: function() {
                    this.gameCore.cancelMoveUp();
                }.bind(this),
            },
            hkRight: {
                defaultHotkey: 'D',
                defaultMouseKey: '',
                name: '右移動',
                keyDown: function() {
                    this.gameCore.sendMoveRight();
                }.bind(this),
                keyUp: function() {
                    this.gameCore.cancelMoveRight();
                }.bind(this),
            },
            hkDown: {
                defaultHotkey: 'S',
                defaultMouseKey: '',
                name: '下移動',
                keyDown: function() {
                    this.gameCore.sendMoveDown();
                }.bind(this),
                keyUp: function() {
                    this.gameCore.cancelMoveDown();
                }.bind(this),
            },
            hkLeft: {
                defaultHotkey: 'A',
                defaultMouseKey: '',
                name: '左移動',
                keyDown: function() {
                    this.gameCore.sendMoveLeft();
                }.bind(this),
                keyUp: function() {
                    this.gameCore.cancelMoveLeft();
                }.bind(this),
            },
            hkHotkeyMenu: {
                defaultHotkey: 'ESC',
                defaultMouseKey: '',
                name: 'ホットキー設定',
                keyDown: function() {
                    $('#settings-overlays').toggle();
                }.bind(this),
            },
            hkChatEnter: {
                defaultHotkey: 'ENTER',
                defaultMouseKey: '',
                name: 'チャットの送信',
                keyDown: function() {
                    $('#chat-input').focus();
                    if ('' !== $('#chat-input').val()) {
                        this.gameCore.onSend(new AddChat($('#chat-input').val()));
                        $('#chat-input').val('');
                        $('#chat-input').blur();
                    }
                }.bind(this),
            },
        };
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));

        this.createHTML();
        this.createConfig();
        this.loadHotkeys();
    }

    /**
     * キー押し込み
     * @param {*} event 
     * @returns 
     */
    onKeyDown(event) {
        const lowerChar = event.target.tagName.toLowerCase();
        const keyCode = this.getPressedKey(event);
        if (('input' === lowerChar && keyCode !== 'ENTER') || 'textarea' === lowerChar) {
            return;
        }
        if ('' === keyCode || !this.inValidKey(event.keyCode)) {
            return;
        }
        if (Utils.ObjectIsNotNull(this.selectedHotkeyRow) && this.selectedHotkeyRow.attr('id') === 'keyInput') {
            event.preventDefault();
            if (this.keyBind[this.selectedHotkeyRow.text()]) {
                delete this.keyBind[this.selectedHotkeyRow.text()];
            }
            if ('DELETE' === keyCode) {
                this.selectedHotkeyRow.text('');
            } else if ('' !== keyCode) {
                this.keyBind[keyCode] = this.selectedHotkeyRow.parent().attr('id');
                this.selectedHotkeyRow.text(keyCode);
            }
            this.selectedHotkeyRow.removeClass('selected');
            this.selectedHotkeyRow = null;
            this.saveHotkeys();
        }
        const keyBind = this.keyBind[keyCode];
        if (keyBind) {
            if (this.config[keyBind]?.keyDown) {
                this.config[keyBind].keyDown();
            }
        }
        if ('ENTER' !== keyCode) {
            event.preventDefault();
        }
    }

    /**
     * キー押し上げ
     * @param {*} event 
     * @returns 
     */
    onKeyUp(event) {
        const lowerChar = event.target.tagName.toLowerCase();
        const keyCode = this.getPressedKey(event);
        if (('input' === lowerChar && keyCode !== 'ENTER') || 'textarea' === lowerChar) {
            return;
        }
        event.preventDefault();
        if (!this.inValidKey(event.keyCode) || '' === keyCode) {
            return;
        }
        if (this.config[this.keyBind[keyCode]]?.keyUp) {
            this.config[this.keyBind[keyCode]].keyUp();
        }
    }

    /**
     * マウスボタンの取得
     * @param {*} event 
     * @returns 
     */
    getMouseKey(event) {
        const mouseKey = event.button;
        switch (mouseKey) {
            case 0:
                return 'LEFT';
            case 1:
                return 'CENTER';
            case 2:
                return 'RIGHT';
            case 3:
                return 'OPTION1';
            case 4:
                return 'OPTION2';
            default:
                return '';
        }
    }

    /**
     * キーコード検証
     * @param {*} keyCode 
     * @returns 
     */
    inValidKey(keyCode) {
        if (48 <= keyCode && 57 >= keyCode) {
            return true;
        }
        if (65 <= keyCode && 90 >= keyCode) {
            return true;
        }
        return !!(9 === keyCode || 13 === keyCode || 27 === keyCode || 32 === keyCode || 46 === keyCode);
    }

    /**
     * キーを取得 同時押し込み
     * @param {*} event 
     * @returns 
     */
    getPressedKey(event) {
        let optionalKey = '';
        if (event.ctrlKey || event.keyCode === 17) {
            optionalKey += 'CTRL+';
        } else if (event.altKey || event.keyCode === 18) {
            optionalKey += 'ALT+';
        }
        return `${optionalKey}${Utils.keyCodeToString(event.keyCode)}`;
    }

    /**
     * コンフィグのロード
     */
    createConfig() {
        for (const key in this.config) {
            if (!this.config[key]?.defaultHotkey) continue;
            if ('' !== this.config[key].defaultHotkey) {
                this.keyBind[this.config[key].defaultHotkey] = key;
                this.mouseBind[this.config[key].defaultMouseKey] = key;
            }
        }
    }

    /**
     * HTML作成
     */
    createHTML() {
        const hotkeyTable = $('#settings-container');
        for (const key in this.config) {
            const hotkey = this.config[key];

            const divEl = $('<div>').addClass('setting-row').css('display', 'flex').attr('id', key);
            const labelEl = $('<label>').addClass('setting-row-name').text(hotkey.name || key);
            divEl.append(labelEl);
            const inputElKey = $('<span>').attr('type', 'text').attr('id', 'keyInput').text(hotkey.defaultHotkey).addClass('hotkey-input-text');
            divEl.append(inputElKey);
            
            inputElKey.on('click', function() {
                if (Utils.ObjectIsNotNull(this.selectedHotkeyRow)) {
                    this.selectedHotkeyRow.removeClass('selected');
                    this.selectedHotkeyRow = null;
                }
                this.selectedHotkeyRow = inputElKey;
                inputElKey.addClass('selected');
            }.bind(this));
            hotkeyTable.append(divEl);
        }
    }

    /**
     * ホットキーの保存
     */
    saveHotkeys() {
        Utils.setLocalStorage('hotkeys', JSON.stringify(this.keyBind));
        this.changeElementText();
    }

    changeElementText() {
        for (let key in this.keyBind) {
            this.changeHotkeyElementText(this.keyBind[key], key);
        }
    }

    /**
     * ホットキーの読み込み
     */
    loadHotkeys() {
        const hotkeys = Utils.getLocalStorage('hotkeys');
        if (hotkeys) {
            this.keyBind = JSON.parse(hotkeys);
        }
        this.changeElementText();
    }

    /**
     * ホットキー要素のテキストを変換
     * @param {*} id 
     * @param {*} text 
     */
    changeHotkeyElementText(id, text) {
        $('#' + id).find('#keyInput').text(text);
    }

    /**
     * マウス要素のテキストを変換
     * @param {*} id 
     * @param {*} text 
     */
    changeMouseElementText(id, text) {
        $('#' + id).find('#mouseInput').text(text);
    }

    /**
     * インスタンスの生成
     * @param {*} engine 
     * @returns 
     */
    static create(engine) {
        return new Hotkey(engine);
    }
}