import BinaryReader from "./common/BinaryReader";
import Hotkey from "./common/HotKey";
import Character from "./entity/Character";
import $ from 'jquery';
import Utils from "./common/Utils";

export default class GameCore {
    constructor() {
        this.hotkey = new Hotkey(this);
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
        this.canvas.width = 640;
        this.canvas.height = 480;

        this.trackingId = 0;
        this.players = {};
        this.characters = {};

        this.websocket = new WebSocket('ws://localhost:9000');
        this.websocket.binaryType = 'arraybuffer';
        this.websocket.onopen = function() {
            console.log('Connected to server');
        }
        this.websocket.onmessage = this.messageHandler.bind(this);
        this.websocket.onclose = function() {
            console.log('Disconnected from server');
        }
        this.lastPingTime = 0;
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        Object.values(this.characters).forEach(character => {
            if (character.id === this.trackingId) {
                this.ctx.fillStyle = "rgb(0, 255, 0)";
            } else {
                this.ctx.fillStyle = "rgb(255, 255, 255)";
            }
            this.ctx.fillRect(character.x, character.y, 30, 30);
        });

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
        this.calcServerPingTime();
        this.calcNetworkBufferUsage();
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
        // this.characters.push(character);
    }

    /**
     * チャット情報を受信する
     * @param {*} reader 
     */
    addChat(reader) {
        const id = reader.getUint32();
        const sender = reader.getString();
        const message = reader.getString();
        
        const divEl = $("<div>");
        const senderEl = $("<span>").text(`[${id}]${sender}:`);
        divEl.append(senderEl);
        const messageEl = $("<span>").addClass("msg").text(message);
        divEl.append(messageEl);
        $("#chatroom").append(divEl);
        $("#chatroom").scrollTop($("#chatroom").prop("scrollHeight"));
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
        const deltaTime = reader.getFloat();
        const frameRate = reader.getFloat();

        $('#server-cpu-usage').text('ServerCPU: ' + cpuUsage + '%');
        $('#server-memory-usage').text('ServerMemory: ' + Math.floor(memoryUsage * 100) / 100 + '%');
        $('#server-delta-time').text('ServerDeltaTime: ' + deltaTime + 'ms');
        $('#server-frame-rate').text('ServerFrameRate: ' + Math.floor(frameRate) + 'fps');
    }

    /**
     * キャラクターのステータスを更新する
     * @param {*} reader 
     */
    updateCharacters(reader) {
        const characters = {};
        const count = reader.getUint8();
        for (let i = 0; i < count; i++) {
            const id = reader.getUint32();
            const x = reader.getFloat();
            const y = reader.getFloat();
            characters[id] = {id, x, y};
        }

        const newData = Object.keys(characters);
        const oldData = Object.keys(this.characters);
        const addIds = Utils.findElement(newData, oldData);
        const delIds = Utils.findElement(oldData, newData);
        addIds.forEach(id => {
            this.characters[id] = characters[id];
        });
        newData.forEach(id => {
            this.characters[id] = characters[id];
        });
        delIds.forEach(id => {
            delete this.characters[id];
        });
    }

    /**
     * パケットを送信する
     * @param {*} packet 
     */
    onSend(packet) {
        if (this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(packet.getPacket());
        }
    }

    /**
     * サーバーの応答時間を計算する
     */
    calcServerPingTime() {
        const now = Date.now();
        const ping = now - this.lastPingTime;
        this.lastPingTime = now;
        $('#server-ping').text('ServerPing: ' + ping + 'ms');
    }

    /**
     * ネットワークバッファの使用率を計算する
     */
    calcNetworkBufferUsage() {
        const buffer = this.websocket.bufferedAmount;
        const usage = buffer / this.websocket.bufferedAmountMax * 100;

        if (usage > 100) {
            $('#network-buffer-usage').css('color', 'red');
        } else {
            $('#network-buffer-usage').css('color', 'black');
        }
        if (!Number.isNaN(usage)) {
            $('#network-buffer-usage').text('NetworkBuffer: ' + Math.floor(usage * 100) / 100 + '%');
        }
    }
}