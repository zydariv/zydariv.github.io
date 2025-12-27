import * as ex from 'excalibur';
import { Resources } from './resources';
import { Config } from './config';
import { Chest } from './chest';
import { CustomText } from './customtext';
import { DialogManager } from './dialogmanager';
import { Daniel } from './daniel';
import { Vio } from './vio';
import { GameStatus } from './gamestatus';

export class Player extends ex.Actor {
    constructor(pos: ex.Vector) {
        super({
            pos,
            width: 16,
            height: 16,
            collisionType: ex.CollisionType.Active
        })
    }

    current_graphics = ""; 
    //private _textengine: CustomText;
    onInitialize(engine: ex.Engine): void {
        engine.currentScene.camera.strategy.lockToActor(this);
        const playerSpriteSheet = ex.SpriteSheet.fromImageSource({
            image: Resources.HeroSpriteSheetPng as ex.ImageSource,
            grid: {
                spriteWidth: 16,
                spriteHeight: 16,
                rows: 8,
                columns: 8
            }
        });
        
        const leftIdle = new ex.Animation({
            frames: [
                {graphic: playerSpriteSheet.getSprite(0, 1) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(1, 1) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(2, 1) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(3, 1) as ex.Sprite, duration: Config.PlayerFrameSpeed},
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
                {graphic: playerSpriteSheet.getSprite(0, 0) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(1, 0) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(2, 0) as ex.Sprite, duration: Config.PlayerFrameSpeed},
                {graphic: playerSpriteSheet.getSprite(3, 0) as ex.Sprite, duration: Config.PlayerFrameSpeed},
            ]
        })
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
        const ratio = 1;
        const threshold = 0.4;

        const gp = engine.input.gamepads.at(0);
        const up = gp.getButton(ex.Buttons.DpadUp);
        const down = gp.getButton(ex.Buttons.DpadDown);
        const left = gp.getButton(ex.Buttons.DpadLeft);
        const right = gp.getButton(ex.Buttons.DpadRight);

        // Check if Player was frozen
        if (DialogManager.freeze_player == false) {
            // UP
            if (
                engine.input.keyboard.isHeld(ex.Keys.ArrowUp)
                ||
                (up > threshold && up >= down * ratio && up >= left * ratio && up >= right * ratio && left == 0 && right == 0)
            ) {
                dir.y = -1;
                this.graphics.use(this._currentAnim = 'up-walk');
                this.current_graphics = 'up-idle';
            }

            // DOWN
            else if (
                engine.input.keyboard.isHeld(ex.Keys.ArrowDown)
                ||
                (down > threshold && down >= up * ratio && down >= left * ratio && down >= right * ratio && left == 0 && right == 0)
            ) {
                dir.y = 1;
                this.graphics.use(this._currentAnim = 'down-walk');
                this.current_graphics = 'down-idle';
            }

            // RIGHT
            else if (
                engine.input.keyboard.isHeld(ex.Keys.ArrowRight)
                ||
                (right > 0)//&& right >= left * ratio && right >= up * ratio && right >= down * ratio)
            ) {
                dir.x = 1;
                this.graphics.use(this._currentAnim = 'right-walk');
                this.current_graphics = 'right-idle';
            }

            // LEFT
            else if (
                engine.input.keyboard.isHeld(ex.Keys.ArrowLeft)
                ||
                (left > 0)//&& left >= right * ratio && left >= up * ratio && left >= down * ratio)
            ) {
                dir.x = -1;
                this.graphics.use(this._currentAnim = 'left-walk');
                this.current_graphics = 'left-idle';
            }
            
            if (dir.x !== 0 && dir.y !== 0) {
                dir = dir.normalize();
            }
            
            this.vel = dir.scale(Config.PlayerSpeed);

            //if (gp.getButton(ex.Buttons.Face1) > 0){
            //   this.graphics.use(this._currentAnim = 'right-walk');
            //}
        }

    }

    onPreCollisionResolve(self: ex.Collider, other: ex.Collider, side: ex.Side, contact: ex.CollisionContact): void {
        const otherOwner = other.owner;
        if (otherOwner instanceof ex.TileMap) {
            for (let contactPoint of contact.points) {
                // Nudge into the tile zone by direction
                const maybeTile = otherOwner.getTileByPoint(contactPoint.add(this.vel.normalize()));
                if (maybeTile?.solid) {
                    const targetMidW = maybeTile.pos.x + (maybeTile.width / 2);
                    const targetMidH = maybeTile.pos.y + (maybeTile.height / 2);

                    break;
                }
            }
        }
        if (otherOwner instanceof Chest) {
            otherOwner.open();
            DialogManager.say("Du hast die Truhe mit dem Schatz gefunden!", true);
        }

        if (otherOwner instanceof Daniel) {
            if (GameStatus.schatz_gefunden == false) {
            DialogManager.say("DANIEL: Oh nein, wir\n haben unseren \nSchatz verloren,\nfindest du ihn wieder?", true);
            } else {
                DialogManager.say("DANIEL: Danke, du hast unsere Ringe gefunden. Jetzt können wir endlich heiraten.", true);
            }
        }

        if (otherOwner instanceof Vio) {
            if (GameStatus.schatz_gefunden == false) {
            DialogManager.say("VIO: Oh nein, wir\n haben unseren \nSchatz verloren,\nfindest du ihn wieder?", true);
            } else {
                DialogManager.say("VIO: Danke, du hast unsere Ringe gefunden. Jetzt können wir endlich heiraten.", true);
            }
        }

    }
}