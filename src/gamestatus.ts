import * as ex from 'excalibur';
import nipplejs from "nipplejs";

export class GameStatus {

    static schatz_gefunden = false;

    // nipplejs joystick instance
    static joystick : nipplejs.Joystick | null = null;

    // Shared joystick vector (updated by main when joystick emits events)
    static joystickVector: ex.Vector = ex.vec(0, 0);

}