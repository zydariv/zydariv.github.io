import { ImageFiltering, ImageSource, Loadable, Loader, Resource, TileMap, SpriteFont, SpriteSheet, Vector } from "excalibur";
import { TiledResource } from '@excaliburjs/plugin-tiled';

// Import paths to work with Parcel
import heroPath from '../img/Solaria Demo Pack Update 03/Solaria Demo Pack Update 03/16x16/Sprites/Hero 01.png';
//import vioPath from '../img/Solaria Demo Pack Update 03/Solaria Demo Pack Update 03/16x16/Sprites/Hero 01.png';
import viodanielPath from '../img/Solaria Demo Pack Update 03/Solaria Demo Pack Update 03/16x16/Sprites/characters.png';
import tilesetPath from '../img/Solaria Demo Pack Update 03/Solaria Demo Pack Update 03/16x16/Tilesets/Solaria Demo Update 01.png';
//import tilesetPath from '../img/Solaria Demo Pack Update 03/Solaria Demo Pack Update 03/16x16/Tilesets/tinySLATES.png';
import fontPath from '../img/Solaria Demo Pack Update 03/Solaria Demo Pack Update 03/16x16/Sprites/font.png';
//import tmxPath from '../res/first-level.tmx';
import tmxPath from '../res/danielmap.tmx';
import tsxPath from '../res/tileset.tsx';
import { Player } from "./player";
import { Chest } from "./chest";
import { Daniel } from "./daniel";
import { Vio } from "./vio";

export const Resources = {
    HeroSpriteSheetPng: new ImageSource(heroPath, false, ImageFiltering.Pixel),
    TileSetPng: new ImageSource(tilesetPath, false, ImageFiltering.Pixel),
    FontSpritePng: new ImageSource(fontPath, false, ImageFiltering.Pixel),
    VioDanielSheetPng: new ImageSource(viodanielPath, false, ImageFiltering.Pixel),
    TiledMap: new TiledResource(tmxPath, {
      entityClassNameFactories: {
        player: (props) => {
          const player = new Player(props.worldPos);
          player.z = 99;
          return player;
        },
        chest: (props) => {
          const chest = new Chest(props.worldPos);
          chest.z = 99;
          return chest;
        },
        daniel: (props) => {
          const daniel = new Daniel(props.worldPos);
          daniel.z = 99;
          return daniel;
        },
        vio: (props) => {
          const vio = new Vio(props.worldPos);
          vio.z = 99;
          return vio;
        },
      },
      // Path map intercepts and redirects to work around parcel's static bundling
      pathMap: [
        //{ path: 'first-level.tmx', output: tmxPath },
        { path: 'danielmap.tmx', output: tmxPath},
        { path: 'Solaria Demo Update 01.png', output: tilesetPath },
        //{ path: 'tinySLATES.png', output: tilesetPath },
        { path: 'tileset.tsx', output: tsxPath }
      ]
    }),
}

export const loader = new Loader();
for (let resource of Object.values(Resources)) {
    loader.addResource(resource);
}