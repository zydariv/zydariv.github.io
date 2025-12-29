import * as ex from 'excalibur';
import nipplejs from "nipplejs";
import { Resources, loader } from './resources';
import { CustomText } from './customtext';
import { DialogManager } from './dialogmanager';
import { GameStatus } from './gamestatus';

// Use a square virtual resolution so the camera aspect ratio is 1:1
const VIRTUAL_SIZE = 320;

const devicePR = Math.max(1, Math.floor(window.devicePixelRatio || 1));

const game = new ex.Engine({
    width: VIRTUAL_SIZE,
    height: VIRTUAL_SIZE,
    canvasElementId: 'game',
    pixelArt: true,
    // Use an integer pixelRatio based on device to keep scaling crisp
    pixelRatio: devicePR,
    // Fit screen but we'll adjust the canvas CSS to keep it square and centered
    displayMode: ex.DisplayMode.FitScreen,
    // let Excalibur handle HiDPI scaling
    suppressHiDPIScaling: false
});

const gametext = new CustomText(new ex.Vector(20, VIRTUAL_SIZE - 25), VIRTUAL_SIZE, VIRTUAL_SIZE);

DialogManager.init(gametext);
game.start(loader).then(() => {
    // Add Tiled map and UI
    Resources.TiledMap.addToScene(game.currentScene);
    game.currentScene.add(gametext);

    // Joystick handling: only create on touch devices when no physical gamepad is connected
    let joystickInstance: any = null;

    function hasPhysicalGamepad() {
        const gps = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const gp of gps as any) {
            if (gp && gp.connected) return true;
        }
        return false;
    }

    function isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    }

    function createJoystickIfNeeded() {
        const zone = document.getElementById('zone');
        const btnB = document.getElementById('btn-b');

        const shouldShow = isTouchDevice() && !hasPhysicalGamepad();

        // If we shouldn't show controls, destroy existing joystick and hide UI
        if (!shouldShow) {
            destroyJoystick();
            if (zone) zone.style.display = 'none';
            if (btnB) btnB.style.display = 'none';
            return;
        }

        // Ensure we have the zone element
        if (!zone) return;

        // If joystick already exists, make sure UI is visible and return
        if (joystickInstance) {
            zone.style.display = 'block';
            if (btnB) btnB.style.display = 'flex';
            return;
        }

        // Make the zone visible first so nipplejs can measure dimensions correctly
        zone.style.display = 'block';
        if (btnB) btnB.style.display = 'flex';

        // Center the static joystick inside the visible zone using pixel coordinates
        const zrect = zone.getBoundingClientRect();
        const posLeft = Math.floor(zrect.width / 2);
        const posTop = Math.floor(zrect.height / 2);
        if ((window as any).DEBUG_JOYSTICK) console.debug('zone rect before create', zrect, { posLeft, posTop });

        // Create joystick with pixel-based static position centered in zone
        joystickInstance = nipplejs.create({
            zone: zone,
            mode: 'static',
            position: { left: `${posLeft}px`, top: `${posTop}px` },
            color: 'cyan'
        });

        GameStatus.joystick = joystickInstance;
        if ((window as any).DEBUG_JOYSTICK) console.debug('joystick created', joystickInstance);
        // Update shared joystick vector for players to read
        joystickInstance.on('move', (_evt: any, data: any) => {
            if (!data.vector) return;
            const x = data.vector.x;
            const y = data.vector.y;
            GameStatus.joystickVector = ex.vec(x, -y);//.normalize();

        });
        joystickInstance.on('end', () => {
            GameStatus.joystickVector = ex.vec(0, 0);
        });
    }

    function destroyJoystick() {
        if (joystickInstance) {
            try { joystickInstance.destroy(); } catch (e) { /* ignore */ }
            joystickInstance = null;
            GameStatus.joystick = null as any;
        }
        const zone = document.getElementById('zone');
        const btnB = document.getElementById('btn-b');
        if (zone) zone.style.display = 'none';
        if (btnB) btnB.style.display = 'none';
    }

    // Initial setup
    createJoystickIfNeeded();

    // Recreate/destroy on gamepad connect/disconnect
    window.addEventListener('gamepadconnected', () => {
        destroyJoystick();
    });
    window.addEventListener('gamepaddisconnected', () => {
        createJoystickIfNeeded();
    });

    // Canvas sizing: keep the game canvas square and centered using the smaller viewport dimension
    function updateCanvasSquare() {
        const canvas = document.getElementById('game') as HTMLCanvasElement | null;
        if (!canvas) return;
        // Use the smaller dimension; for landscape this will be the height (as requested)
        let size = Math.min(window.innerWidth, window.innerHeight);
        // make slightly smaller to avoid touching OS UI
        size = Math.floor(size * 0.95);
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';

        // Position the dialog exactly inside the canvas lower third
        const dialog = document.getElementById('dialog');
        const dialogInner = document.querySelector('#dialog .dialog-inner') as HTMLElement | null;
        if (dialog && dialogInner) {
            const rect = canvas.getBoundingClientRect();
            const dialogHeight = Math.floor(rect.height / 3);
            dialog.style.left = rect.left + 'px';
            dialog.style.top = (rect.top + rect.height - dialogHeight) + 'px';
            dialog.style.width = rect.width + 'px';
            dialog.style.height = dialogHeight + 'px';

            // ensure the dialog-inner fills the parent (no horizontal padding/margin)
            dialogInner.style.width = '100%';
            dialogInner.style.height = '100%';
            dialogInner.style.maxWidth = rect.width + 'px';
        }

        // B button remains fixed (CSS). Ensure it stays on-screen and outside the canvas if possible
        const btnB = document.getElementById('btn-b');
        if (btnB) {
            const rect = canvas.getBoundingClientRect();
            const btnRect = btnB.getBoundingClientRect();
            const gapRight = window.innerWidth - rect.right; // space to right of canvas
            const desiredGap = 16; // desired distance from viewport edge
            if (gapRight < btnRect.width + desiredGap) {
                // not enough space, move button left by extra amount so it remains visible
                const extra = (btnRect.width + desiredGap) - gapRight;
                btnB.style.right = (desiredGap + extra) + 'px';
            } else {
                btnB.style.right = desiredGap + 'px';
            }
        }
    }
    updateCanvasSquare();
    window.addEventListener('resize', () => {
        updateCanvasSquare();
        // Recreate joystick on resize so nipplejs recalibrates to new zone size
        if (isTouchDevice()) {
            destroyJoystick();
            setTimeout(() => createJoystickIfNeeded(), 100);
        } else {
            createJoystickIfNeeded();
        }
    });
    window.addEventListener('orientationchange', () => {
        // allow the browser to settle, then resize and re-create joystick for correct calibration
        setTimeout(() => {
            updateCanvasSquare();
            if (isTouchDevice()) {
                destroyJoystick();
                setTimeout(() => createJoystickIfNeeded(), 150);
            } else {
                createJoystickIfNeeded();
            }
        }, 300);
    });
});