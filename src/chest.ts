import * as ex from 'excalibur';
import { Resources } from './resources';
import { Config } from './config';
import { GameStatus } from './gamestatus';

export class Chest extends ex.Actor {
    constructor(pos: ex.Vector) {
        super({
            pos,
            width: 16,
            height: 16,
            collisionType: ex.CollisionType.Fixed
        })
    }

    current_graphics = "closed"; 

    onInitialize(engine: ex.Engine): void {
        const chestSpriteSheet = ex.SpriteSheet.fromImageSource({
            image: Resources.TileSetPng as ex.ImageSource,
            grid: {
                spriteWidth: 16,
                spriteHeight: 16,
                rows: 15,
                columns: 28
            }
        });

        const closed = new ex.Animation({
            frames: [
                {graphic: chestSpriteSheet.getSprite(6, 8) as ex.Sprite, duration: Config.PlayerFrameSpeed},
            ]
        })
        this.graphics.add('closed', closed);

        const open = new ex.Animation({
            frames: [
                {graphic: chestSpriteSheet.getSprite(6, 9) as ex.Sprite, duration: Config.PlayerFrameSpeed},
            ]
        })
        this.graphics.add('open', open);
    }

    private _currentAnim = 'closed';

    onPreUpdate(engine: ex.Engine, elapsedMs: number): void {
        this.graphics.use(this._currentAnim = this.current_graphics);
    }

    onPreCollisionResolve(self: ex.Collider, other: ex.Collider, side: ex.Side, contact: ex.CollisionContact): void {
    }

    public open(): void {
        this.graphics.use(this._currentAnim = 'open');
        this.current_graphics='open';
        GameStatus.schatz_gefunden = true;
    }
}