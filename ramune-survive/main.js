import './style.css'
import GameCore from './src/GameCore';

const gameCore = new GameCore();
gameCore.loadAssets();

window.onload = function() {
  gameCore.initialize();
  gameCore.update();
}
