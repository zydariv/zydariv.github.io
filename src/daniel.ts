import * as ex from 'excalibur';
import { Resources } from './resources';
import { Config } from './config';
import { Chest } from './chest';
import { CustomText } from './customtext';
import { DialogManager } from './dialogmanager';

export class Daniel extends ex.Actor {
    constructor(pos: ex.Vector) {
        super({
            pos,
            width: 16,
            height: 24,
            collisionType: ex.CollisionType.Fixed
        })
    }

    current_graphics = ""; 
    //private _textengine: CustomText;
    onInitialize(engine: ex.Engine): void {
        const playerSpriteSheet = ex.SpriteSheet.fromImageSource({
            image: Resources.VioDanielSheetPng as ex.ImageSource,
            grid: {
                spriteWidth: 32,
                spriteHeight: 48,
                rows: 16,
                columns: 28
            }
        });
        
        const leftIdle = new ex.Animation({
            frames: [
                {graphic: playerSpriteSheet.getSprite(8, 1) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(9, 1) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(10, 1) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(11, 1) as ex.Sprite, duration: Config.PlayerFrameSpeed},
            ]
        })
        this.graphics.add('left-idle', leftIdle);

        const rightIdle = new ex.Animation({
            frames: [
                {graphic: playerSpriteSheet.getSprite(0, 2) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(1, 2) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(2, 2) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(3, 2) as ex.Sprite, duration: Config.PlayerFrameSpeed},
            ]
        })
        this.graphics.add('right-idle', rightIdle);


        const upIdle = new ex.Animation({
            frames: [
                {graphic: playerSpriteSheet.getSprite(0, 3) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(1, 3) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(2, 3) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(3, 3) as ex.Sprite, duration: Config.PlayerFrameSpeed},
            ]
        })
        this.graphics.add('up-idle', upIdle);

        const downIdle = new ex.Animation({
            frames: [
                {graphic: playerSpriteSheet.getSprite(12, 0) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(13, 0) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(14, 0) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(15, 0) as ex.Sprite, duration: Config.PlayerFrameSpeed},
            ]
        })
        downIdle.scale = ex.vec(0.5,0.5);
        this.graphics.add('down-idle', downIdle);

        this.current_graphics = 'down-idle';

        const leftWalk = new ex.Animation({
            frames: [
                {graphic: playerSpriteSheet.getSprite(0, 5) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(1, 5) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(2, 5) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(3, 5) as ex.Sprite, duration: Config.PlayerFrameSpeed},
            ]
        })
        this.graphics.add('left-walk', leftWalk);

        const rightWalk = new ex.Animation({
            frames: [
                {graphic: playerSpriteSheet.getSprite(0, 6) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(1, 6) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(2, 6) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(3, 6) as ex.Sprite, duration: Config.PlayerFrameSpeed},
            ]
        });
        this.graphics.add('right-walk', rightWalk);

        const upWalk = new ex.Animation({
            frames: [
                {graphic: playerSpriteSheet.getSprite(0, 7) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(1, 7) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(2, 7) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(3, 7) as ex.Sprite, duration: Config.PlayerFrameSpeed},
            ]
        });
        this.graphics.add('up-walk', upWalk);

        const downWalk = new ex.Animation({
            frames: [
                {graphic: playerSpriteSheet.getSprite(0, 4) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(1, 4) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(2, 4) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(3, 4) as ex.Sprite, duration: Config.PlayerFrameSpeed},
            ]
        });
        this.graphics.add('down-walk', downWalk);
    }
    private _currentAnim = 'down-idle';

    onPreUpdate(engine: ex.Engine, elapsedMs: number): void {
        let dir = ex.Vector.Zero;
        this.graphics.use(this._currentAnim = this.current_graphics);

        if (true) {
            dir.y = -1;
            //this.graphics.use(this._currentAnim = 'up-walk');
            //this.current_graphics = 'up-idle';
        }

    }

    onPreCollisionResolve(self: ex.Collider, other: ex.Collider, side: ex.Side, contact: ex.CollisionContact): void {
    }
}