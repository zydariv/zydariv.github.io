import * as ex from 'excalibur';
import { Resources } from './resources';
import { DialogManager } from './dialogmanager';

export class CustomText extends ex.Actor {
    constructor(pos: ex.Vector, width: number, height: number) {
        super({
            pos,
            width: 16,
            height: 16,
            collisionType: ex.CollisionType.PreventCollision,
            anchor: new ex.Vector(0, 0),
            z: 100
        })
    }
    private game_width = this.width;
    private game_height = this.height;
    private visible = false;
    private _currentText = '';
    private _currentObject: ex.Text;
    private _font: ex.SpriteFont;

    onInitialize(engine: ex.Engine): void {
        const spriteFontSheet = ex.SpriteSheet.fromImageSource({
            image: Resources.FontSpritePng as ex.ImageSource,
            grid: {
                spriteWidth: 16,
                spriteHeight: 16,
                rows: 3,
                columns: 16
            }
        });

        const spriteFont = new ex.SpriteFont({
            alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?-()+ ',
            caseInsensitive: true,
            spriteSheet: spriteFontSheet,
            lineHeight: 10
          });
        this._font = spriteFont;
    
    }

    onPreUpdate(engine: ex.Engine, elapsed: number): void {
        const gp = engine.input.gamepads.at(0);
        if (gp.getButton(ex.Buttons.Face1) > 0  || engine.input.keyboard.wasPressed(ex.Keys.Space) || engine.input.pointers.isDown(0)) {
            this.visible = false;
            DialogManager.freeze_player = false;

        }
        if (this.visible == true) {

        this.pos = new ex.Vector(engine.currentScene.camera.pos.x - 50, engine.currentScene.camera.pos.y - 0);
        this.graphics.use(this._currentObject);
       } else {
        //this.graphics.use('');
       }
    }

    public setDialogue(dialogue_text: string) {
        this._currentObject = new ex.Text({
        text: dialogue_text,
        font: this._font,
        maxWidth: 100
        });
        this._currentObject.scale = new ex.Vector(0.9, 0.9);

        this._currentObject = new ex.Text({
            text: dialogue_text,
            maxWidth: 100
        });
        this.visible = true;
      }


}