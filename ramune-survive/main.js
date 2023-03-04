import './style.css'
import GameCore from './src/GameCore';

window.onload = function() {
  const gameCore = new GameCore();
  gameCore.initialize();
  gameCore.update();
}
