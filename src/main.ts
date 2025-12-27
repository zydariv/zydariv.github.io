import * as ex from 'excalibur';
import { Resources, loader } from './resources';
import { CustomText } from './customtext';
import { DialogManager } from './dialogmanager';

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

const gametext = new CustomText(new ex.Vector(20, 99), width, height);

DialogManager.init(gametext);
game.start(loader).then(() => {
    Resources.TiledMap.addToScene(game.currentScene);
    game.currentScene.add(gametext);
    //DialogManager.say("Dies ist ein sehr langer textdsfdfkjsdhfjkashdfjkh hfjkd sjkasdh ashf kahf h f a asdfhk", false);
});