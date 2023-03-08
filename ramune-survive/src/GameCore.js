import BinaryReader from "./common/BinaryReader";
import Hotkey from "./common/HotKey";
import Character from "./entity/Character";
import $ from 'jquery';
import Utils from "./common/Utils";
import Move from "./packet/Move";
import Player from "./entity/Player";
import Bullet from "./entity/Bullet";
import DamageText from "./entity/DamageText";
import AnimImage from "./entity/AnimImage";

export default class GameCore {
    constructor() {
        this.hotkey = new Hotkey(this);
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.trackingId = -1;
        this.trackingEntity = null;
        this.players = {};
        this.characters = {};
        this.bullets = {};
        this.border = { x: 0, y: 0, w: 1000, h:1000 };
        this.lastPingTime = 0;

        this.damageTexts = [];
        this.drawAnimImages = [];

        this.explosionImage = new Image();
        this.explosionImage.src = './assets/image/effect1.png';

        this.charImage = new Image();
        this.charImage.src = './assets/image/char.png';

        this.enemyImage = new Image();
        this.enemyImage.src = './assets/image/enemy1.png';

        this.itemImage = new Image();
        this.itemImage.src = './assets/image/item1.png';

        this.dirtImage = new Image();
        this.dirtImage.src = './assets/image/dirt.png';

        setInterval(this.updateMove.bind(this), 10);
    }

    /**
     * 初期化処理
     */
    initialize() {
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
     * 更新処理
     */
    update() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        let trackingX = 0;
        let trackingY = 0;
        if (Utils.ObjectIsNotNull(this.trackingEntity)) {
            this.ctx.save();
            this.ctx.translate(window.innerWidth * .5, window.innerHeight * .5);
            this.ctx.scale(1, 1);
            trackingX = this.trackingEntity.position.x;
            trackingY = this.trackingEntity.position.y;
            if (this.trackingEntity.position.x - window.innerWidth * .5 < 0) {
                trackingX = window.innerWidth * .5;
            }
            if (this.trackingEntity.position.y - window.innerHeight * .5 < 0) {
                trackingY = window.innerHeight * .5;
            }
            if (this.trackingEntity.position.x + window.innerWidth * .5 > this.border.w) {
                trackingX = this.border.w - window.innerWidth * .5;
            }
            if (this.trackingEntity.position.y + window.innerHeight * .5 > this.border.h) {
                trackingY = this.border.h - window.innerHeight * .5;
            }
            this.ctx.translate(-trackingX, -trackingY);
        } else {
            if (this.trackingId !== -1) {
                this.trackingEntity = this.characters[this.trackingId];
            }
        }
        const chipSize = 48;
        this.drawBackground(trackingX, trackingY, chipSize)

        this.drawingBorder(this.ctx);
        this.drawingSector(this.ctx);
        
        Object.values(this.characters).forEach(character => {
            if (character.type === 0) {
                this.ctx.drawImage(this.charImage, 32, 32 * 0, 32, 32,
                    character.position.x - chipSize * .5, character.position.y - chipSize * .5, chipSize, chipSize);
            } else if (character.type === 3) {
                this.ctx.drawImage(this.itemImage, 32, 32 * 0, 32, 32,
                    character.position.x - chipSize * .5, character.position.y - chipSize * .5, chipSize, chipSize);
            } else {
                this.ctx.drawImage(this.enemyImage, 32, 32 * 0, 32, 32,
                    character.position.x - chipSize * .5, character.position.y - chipSize * .5, chipSize, chipSize);
            }
            character.position.lerp(character.newPosition, 0.3);
        });
        Object.values(this.bullets).forEach(bullets => {
            this.ctx.fillStyle = "rgb(255, 0, 0)";
            this.ctx.fillRect(bullets.position.x - bullets.size * .5, bullets.position.y - bullets.size * .5, bullets.size, bullets.size);
            bullets.position.lerp(bullets.newPosition, 0.3);
        });
        this.damageTexts.forEach((damageText) => {
            damageText.draw(this.ctx);
            if (damageText.isDelete()) {
                this.damageTexts.splice(this.damageTexts.indexOf(damageText), 1);
            }
        });
        this.drawAnimImages.forEach((drawAnimImage) => {
            drawAnimImage.update()
            drawAnimImage.draw(this.ctx);
            if (drawAnimImage.isDelete()) {
                this.drawAnimImages.splice(this.drawAnimImages.indexOf(drawAnimImage), 1);
            }
        });

        if (Utils.ObjectIsNotNull(this.trackingEntity)) {
            this.ctx.restore();
        }

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
        case 0x08:
            this.addBorder(reader);
            break;
        case 0x09:
            this.addDamageText(reader);
            break;
        case 0x0A:
            this.updateBullets(reader);
            break;
        case 0x0B:
            this.updateLevel(reader);
            break
        }
        this.calcServerPingTime();
        this.calcNetworkBufferUsage();
    }

    addBorder(reader) {
        const x = reader.getFloat();
        const y = reader.getFloat();
        const w = reader.getFloat();
        const h = reader.getFloat();
        this.border = { x, y, w, h };
    }

    /**
     * キャラクターを追加する
     * @param {*} reader 
     */
    addPlayer(reader) {
        const player = new Player(
            reader.getUint32(), 
            reader.getString(), 
            reader.getUint16(), 
            reader.getUint16(), 
            reader.getUint16(), 
            reader.getUint16(), 
            reader.getUint16())
        console.log(player)
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
        const senderEl = $("<span>").text(`${sender}:`);
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
            const id = reader.getUint32();
            const name = reader.getString();
            const score = reader.getUint32();
            learderboard.push({id: id, name: name, score: score});
        }
        // console.log(learderboard);
        
        const divContent = $("<div />");

        divContent.append($(`<div>`));
        divContent.append($(`<span>`).addClass('name-text').text(`NAME`));
        divContent.append($(`<span>`).addClass('mass-text').text(`SCORE`));

        for (const element of learderboard) {
            const nameText = !!element.name ? element.name : "名前無し";
            const massText = Utils.shortUnitText(element.score, 10);
            divContent.append($(`<div>`));
            divContent.append($(`<span>`).text(`${nameText}`).addClass('name-text'));
            divContent.append($(`<span>`).text(`${massText}`).addClass('mass-text'));
        }
        $("#lb_detail").html(divContent);
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
        $('#server-memory-usage').text('ServerMemory: ' + Math.floor(memoryUsage * 100) / 100 + 'MB');
        $('#server-delta-time').text('ServerDeltaTime: ' + deltaTime + 'ms');
        $('#server-frame-rate').text('ServerFrameRate: ' + Math.floor(frameRate) + 'fps');
    }

    /**
     * キャラクターのステータスを更新する
     * @param {*} reader 
     */
    updateCharacters(reader) {
        const characters = {};
        const count = reader.getUint16();
        for (let i = 0; i < count; i++) {
            const id = reader.getUint32();
            const type = reader.getUint8();
            const x = reader.getFloat();
            const y = reader.getFloat();
            const direction = reader.getFloat();
            characters[id] = new Character(id, type, x, y);
        }
        const newData = Object.keys(characters);
        const oldData = Object.keys(this.characters);
        const addIds = Utils.findElement(newData, oldData);
        const delIds = Utils.findElement(oldData, newData);
        addIds.forEach(id => {
            this.characters[id] = characters[id];
        });
        newData.forEach(id => {
            this.characters[id].newPosition.x = characters[id].position.x;
            this.characters[id].newPosition.y = characters[id].position.y;
        });
        delIds.forEach(id => {
            delete this.characters[id];
        });
    }

    /**
     * ダメージテキストを追加する
     * @param {*} reader 
     */
    addDamageText(reader) {
        const x = reader.getFloat();
        const y = reader.getFloat();
        const damage = reader.getString();
        const r = reader.getUint8();
        const g = reader.getUint8();
        const b = reader.getUint8();
        this.damageTexts.push(new DamageText(x, y, damage, r, g, b));
        const drawSize = 48;
        this.drawAnimImages.push(new AnimImage(this.explosionImage, x - drawSize * .5, y - drawSize * .5, 180, drawSize, 10, 0.1));
    }

    /**
     * 弾を更新する
     * @param {*} reader 
     */
    updateBullets(reader) {
        const bullets = {};
        const count = reader.getUint16();
        for (let i = 0; i < count; i++) {
            const id = reader.getUint32();
            const x = reader.getFloat();
            const y = reader.getFloat();
            const size = reader.getFloat();
            bullets[id] = new Bullet(id, x, y, size);
        }
        const newData = Object.keys(bullets);
        const oldData = Object.keys(this.bullets);
        const addIds = Utils.findElement(newData, oldData);
        const delIds = Utils.findElement(oldData, newData);
        addIds.forEach(id => {
            this.bullets[id] = bullets[id];
        });
        newData.forEach(id => {
            this.bullets[id].newPosition.x = bullets[id].position.x;
            this.bullets[id].newPosition.y = bullets[id].position.y;
            this.bullets[id].size = bullets[id].size;
        });
        delIds.forEach(id => {
            delete this.bullets[id];
        });
    }

    updateLevel(reader) {
        const level = reader.getUint16();
        const exp = reader.getUint32();
        // console.log(level, exp);
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

    sendMoveUp() {
        if (!this.isMoveUp) {
            this.isMoveUp = true;
        }
    }

    sendMoveRight() {
        if (!this.isMoveRight) {
            this.isMoveRight = true;
        }
    }

    sendMoveDown() {
        if (!this.isMoveDown) {
            this.isMoveDown = true;
        }
    }

    sendMoveLeft() {
        if (!this.isMoveLeft) {
            this.isMoveLeft = true;
        }
    }

    cancelMoveUp() {
        if (this.isMoveUp) {
            this.isMoveUp = false;
        }
    }

    cancelMoveRight() {
        if (this.isMoveRight) {
            this.isMoveRight = false;
        }
    }

    cancelMoveDown() {
        if (this.isMoveDown) {
            this.isMoveDown = false;
        }
    }

    cancelMoveLeft() {
        if (this.isMoveLeft) {
            this.isMoveLeft = false;
        }
    }

    updateMove() {
        if (this.isMoveUp && this.isMoveRight) {
            this.onSend(new Move(7));
        } else if (this.isMoveRight && this.isMoveDown) {
            this.onSend(new Move(1));
        } else if (this.isMoveDown && this.isMoveLeft) {
            this.onSend(new Move(3));
        } else if (this.isMoveLeft && this.isMoveUp) {
            this.onSend(new Move(5));
        } else if (this.isMoveUp) {
            this.onSend(new Move(6));
        } else if (this.isMoveRight) {
            this.onSend(new Move(0));
        } else if (this.isMoveDown) {
            this.onSend(new Move(2));
        } else if (this.isMoveLeft) {
            this.onSend(new Move(4));
        }
    }

    /**
     * 枠を描画する
     * @param {*} ctx 
     */
    drawingBorder(ctx) {
        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(this.border.x, this.border.y);
        ctx.lineTo(this.border.w, this.border.y);
        ctx.lineTo(this.border.w, this.border.h);
        ctx.lineTo(this.border.x, this.border.h);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
    
    /**
     * セクターを描画する
     * @param {*} ctx 
     */
    drawingSector(ctx) {
        const x = Math.round(this.border.x) + 20;
        const y = Math.round(this.border.y) + 20;
        const w = (Math.round(this.border.w) - 20 - x) * .2;
        const h = (Math.round(this.border.h) - 20 - y) * .2;
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#333333';
        ctx.fillStyle = '#333333';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold " + .5 * w + "px Saira";
        for (let j = 0; j < 5; j++) {
            for (let i = 0; i < 5; i++) {
                ctx.fillText((String.fromCharCode('A'.charCodeAt(0) + j)) + (i + 1), x + w * i + w / 2, y + h * j + h / 2);
                ctx.strokeRect(x + w * i, y + h * j, w, h);
            }
        }
        ctx.stroke();
        ctx.restore();
    }

    /**
     * 背景を描画する
     * @param {*} trackingX 
     * @param {*} trackingY 
     * @param {*} chipSize 
     */
    drawBackground(trackingX, trackingY, chipSize) {
        const drawStartX = ~~((trackingX - window.innerWidth * .5) / chipSize);
        const drawStartY = ~~((trackingY - window.innerHeight * .5) / chipSize);
        const drawEndX = ~~((trackingX + window.innerWidth * .5) / chipSize);
        const drawEndY = ~~((trackingY + window.innerHeight * .5) / chipSize);
        for (let i = drawStartX; i < drawEndX + 1; i++) {
            for (let j = drawStartY; j < drawEndY + 1; j++) {
                if (i >= 0 && j >= 0 && i < this.border.w / chipSize && j < this.border.h / chipSize) {
                    this.ctx.drawImage(this.dirtImage, 32, 32 * 4, 32, 32,
                        i * chipSize, j * chipSize, chipSize, chipSize);
                }
            }
        }
    }
}