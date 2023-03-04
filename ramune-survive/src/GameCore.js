import BinaryReader from "./common/BinaryReader";
import Hotkey from "./common/HotKey";
import Character from "./entity/Character";
import $ from 'jquery';

export default class GameCore {
    constructor() {
        this.hotkey = new Hotkey(this);
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
        this.canvas.width = 640;
        this.canvas.height = 480;

        this.trackingId = 0;
        this.players = {};
        this.characters = [];

        this.websocket = new WebSocket('ws://localhost:9000');
        this.websocket.binaryType = 'arraybuffer';
        this.websocket.onopen = function() {
            console.log('Connected to server');
        }
        this.websocket.onmessage = this.messageHandler.bind(this);
        this.websocket.onclose = function() {
            console.log('Disconnected from server');
        }
    }

    /**
     * 初期化処理
     */
    initialize() {

    }

    /**
     * 更新処理
     */
    update() {
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        requestAnimationFrame(this.update.bind(this));
    }

    /**
     * メッセージハンドラー
     * @param {*} event 
     */
    messageHandler(event) {
        const reader = new BinaryReader(new DataView(event.data), 0, true);
        const type = reader.getUint8();
        switch (type) {
        case 0x00: // キャラクター情報
            this.addPlayer(reader);
            break;
        case 0x01: // キャラクター情報
            this.updatePlayers(reader);
            break;
        case 0x02: // チャット情報
            this.addChat(reader);
            break;
        case 0x03: // リーダーボード情報
            this.updateLeaderboard(reader);
            break;
        case 0x04: // サーバー情報
            this.updateServerInfo(reader);
            break;
        case 0x05: // サーバー情報
            this.updateServerUsage(reader);
            break;
        case 0x06: // カメラが追跡するキャラクターのID
            this.trackingId = reader.getUint32();
            break;
        case 0x07: // キャラクターのステータスを更新する
            this.updateCharacters(reader);
            break;
        }
    }

    /**
     * キャラクターを追加する
     * @param {*} reader 
     */
    addPlayer(reader) {
        const character = new Character(
            reader.getUint32(), 
            reader.getString(), 
            reader.getUint16(), 
            reader.getUint16(), 
            reader.getUint16(), 
            reader.getUint16(), 
            reader.getUint16())
        this.characters.push(character);
    }

    /**
     * チャット情報を受信する
     * @param {*} reader 
     */
    addChat(reader) {
        const id = reader.getUint32();
        const name = reader.getString();
        const message = reader.getString();
        // console.log(id, name + ': ' + message);
    }

    /**
     * リーダーボードを更新する
     * @param {*} reader 
     */
    updateLeaderboard(reader) {
        const learderboard = [];
        const players = reader.getUint8();
        for (let i = 0; i < players; i++) {
            const id = reader.getUint8();
            const name = reader.getString();
            const score = reader.getUint16();
            learderboard.push({id: id, name: name, score: score});
        }
        console.log(learderboard);
    }

    /**
     * キャラクター情報を更新する
     * @param {*} reader 
     */
    updatePlayers(reader) {
        const players = reader.getUint8();
        for (let i = 0; i < players; i++) {
            const id = reader.getUint8();
            const x = reader.getFloat();
            const y = reader.getFloat();
            this.ctx.fillStyle = "rgb(255, 0, 0)";
            this.ctx.fillRect(x, y, 10, 10);
            console.log(id, x, y);
        }
    }

    /**
     * サーバー情報を更新する
     * @param {*} reader 
     */
    updateServerInfo(reader) {
        const serverName = reader.getString();
        const serverDescription = reader.getString();
        const serverVersion = reader.getString();

        const divEl = $('#lamune-status');
        const serverNameEl = $('<div>').attr('id', 'server-name').text(`ServerName: ${serverName}`);
        divEl.append(serverNameEl);
        const serverDescriptionEl = $('<div>').attr('id', 'server-description').text(`ServerDescription: ${serverDescription}`);
        divEl.append(serverDescriptionEl);
        const serverVersionEl = $('<div>').attr('id', 'server-version').text(`ServerVersion: ${serverVersion}`);
        divEl.append(serverVersionEl);
    }

    /**
     * サーバーの使用率を更新する
     * @param {*} reader 
     */
    updateServerUsage(reader) {
        const cpuUsage = reader.getFloat();
        const memoryUsage = reader.getFloat();
        // console.log('CPU: ' + cpuUsage + '%, Memory: ' + memoryUsage + '%');
    }

    updateCharacters(reader) {
        const characters = reader.getUint8();
        for (let i = 0; i < characters; i++) {
            const id = reader.getUint32();
            const x = reader.getFloat();
            const y = reader.getFloat();
            this.characters.push(new Character(id, '', x, y, 0, 0, 0));
        }
    }

    onSend(packet) {
        if (this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(packet.getPacket());
        }
    }
}