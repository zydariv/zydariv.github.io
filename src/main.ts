import * as ex from 'excalibur';
import nipplejs from "nipplejs";
import { Resources, loader } from './resources';
import { CustomText } from './customtext';
import { DialogManager } from './dialogmanager';
import { GameStatus } from './gamestatus';

const width = 100;//500;
const height = 100;//500;

const game = new ex.Engine({
    width: width,
    height: height,
    canvasElementId: 'game',
    pixelArt: true,
    pixelRatio: 2,
    displayMode: ex.DisplayMode.FitScreenAndFill,
    suppressHiDPIScaling: true
});

const gametext = new CustomText(new ex.Vector(20, 95), width, height);

DialogManager.init(gametext);
game.start(loader).then(() => {
    GameStatus.joystick = nipplejs.create({
        zone: document.getElementById("zone"),
        mode: "static",
        position: { left: "80px", top: "80px" },
        color: "cyan"
    });
    Resources.TiledMap.addToScene(game.currentScene);
    game.currentScene.add(gametext);
});