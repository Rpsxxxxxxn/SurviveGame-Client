import './style.css'
import BinaryReader from './src/common/BinaryReader';

window.onload = function() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 640;
  canvas.height = 480;

  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, 640, 480);

  const websocket = new WebSocket('ws://localhost:9000');
  websocket.binaryType = 'arraybuffer';
  websocket.onopen = function() {
    console.log('Connected to server');
  }
  websocket.onmessage = function(event) {
    const reader = new BinaryReader(new DataView(event.data), 0, true);
    const type = reader.getUint8();
    switch (type) {
      case 0:
        const id = reader.getUint8();
        const name = reader.getUTF8String();
        const hp = reader.getUint16();
        const str = reader.getUint16();
        const dex = reader.getUint16();
        const int = reader.getUint16();
        const luk = reader.getUint16();
        console.log(`Player ${id} ${name} ${hp} ${str} ${dex} ${int} ${luk}`);
        break;
    }
  }
  websocket.onclose = function() {
    console.log('Disconnected from server');
  }


}
