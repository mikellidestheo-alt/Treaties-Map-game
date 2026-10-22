import './style.css';
import { MapScene } from './engine/MapScene.js';
import { Game } from './game/Game.js';

const canvas = document.getElementById('map');
const stage = document.getElementById('stage');

let game;
const scene = new MapScene(canvas, stage, {
  onPick: (id, pos) => game.handlePick(id, pos),
  onHover: (id, pos) => game.handleHover(id, pos),
});
game = new Game(scene);
game.init();

// handy for debugging / automated tests
window.__game = game;
window.__scene = scene;
