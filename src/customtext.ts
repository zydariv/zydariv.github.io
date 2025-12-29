import * as ex from 'excalibur';
import { DialogManager } from './dialogmanager';

export class CustomText extends ex.Actor {
    private dialogEl: HTMLElement | null = null;
    private innerEl: HTMLElement | null = null;
    private moreEl: HTMLElement | null = null;
    private segments: string[] = [];
    private currentSegment = 0;
    private prevGamepadFace1Pressed = false;
    private fullText = '';

    // layout/calc cache
    private fontSizePx: number | null = null;
    private lineHeightPx: number | null = null;
    private charsPerLine: number | null = null;
    private linesPerBox: number = 3;
    private lastOrientation: 'portrait' | 'landscape' | null = null;

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

    onInitialize(engine: ex.Engine): void {
        // Find or create the dialog overlay elements
        this.dialogEl = document.getElementById('dialog');
        this.innerEl = this.dialogEl?.querySelector('.dialog-text') as HTMLElement | null;
        this.moreEl = this.dialogEl?.querySelector('.dialog-more') as HTMLElement | null;

        // B button hook: pointerup advances dialog (consistent with release behavior)
        const btnB = document.getElementById('btn-b');
        if (btnB) {
            btnB.addEventListener('pointerup', (e) => {
                e.preventDefault();
                this.advance();
            });
            btnB.addEventListener('pointerdown', (e) => e.preventDefault());
        }

        if (this.dialogEl) {
            // Advance on pointer release (not pointerdown) to avoid skipping multiple segments while holding
            this.dialogEl.addEventListener('pointerup', (e) => {
                e.preventDefault();
                this.advance();
            });
            // Prevent accidental pointerdown interactions propagating to the canvas
            this.dialogEl.addEventListener('pointerdown', (e) => e.preventDefault());

            // Recompute segmentation and font sizing only when the orientation actually changes
            window.addEventListener('resize', () => {
                const current = window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape';
                if (current !== this.lastOrientation) {
                    this.lastOrientation = current;
                    if (this.isVisible() && this.fullText) {
                        const prev = this.currentSegment;
                        // recompute sizing and resegment
                        this.computeSizing();
                        this.setDialogue(this.fullText);
                        // jump to the nearest segment index so the player doesn't lose place
                        this.currentSegment = Math.min(prev, this.segments.length - 1);
                        this.showSegment(this.currentSegment);
                    } else {
                        // update sizing for next dialog
                        this.computeSizing();
                    }
                }
            });

            // Also compute sizing at initialization
            this.computeSizing();
        }
    }

    onPreUpdate(engine: ex.Engine, elapsed: number): void {
        const gp = engine.input.gamepads.at(0);
        // advance on release: keyboard.wasReleased, pointerup handled via DOM event, gamepad release detected here
        if (engine.input.keyboard.wasReleased(ex.Keys.Space) && this.isVisible()) {
            this.advance();
        }

        const face1Pressed = gp.getButton(ex.Buttons.Face1) > 0;
        if (this.prevGamepadFace1Pressed && !face1Pressed && this.isVisible()) {
            // button was released
            this.advance();
        }
        this.prevGamepadFace1Pressed = face1Pressed;
    }

    private isVisible() {
        return this.dialogEl?.classList.contains('visible') ?? false;
    }

    private computeSizing() {
        if (!this.innerEl || !this.dialogEl) return;
        // Ensure dialog is rendered (not display:none) while measuring — temporarily show hidden dialog to get real sizes
        let restoredStyles = false;
        let oldDisplay = '';
        let oldVisibility = '';
        if (!this.isVisible()) {
            oldDisplay = this.dialogEl.style.display;
            oldVisibility = this.dialogEl.style.visibility;
            this.dialogEl.style.display = 'flex';
            this.dialogEl.style.visibility = 'hidden';
            // Force layout
            this.dialogEl.getBoundingClientRect();
            restoredStyles = true;
        }

        const container = this.innerEl;
        const compStyle = window.getComputedStyle(container);
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Restore previous visibility if we changed it
        if (restoredStyles && this.dialogEl) {
            this.dialogEl.style.display = oldDisplay;
            this.dialogEl.style.visibility = oldVisibility;
        }
        console.log('containerwidth', containerWidth, 'containerheight', containerHeight);
        // If still zero (fallback), compute from canvas third (no arbitrary subtraction)
        let effectiveHeight = containerHeight > 0 ? containerHeight : 0;
        if (effectiveHeight != 0) {
            const canvas = document.getElementById('game') as HTMLCanvasElement | null;
            if (canvas) {
                const crect = canvas.getBoundingClientRect();
                // Use exact third of canvas height (no extra subtraction)
                effectiveHeight = Math.max(10, Math.floor(crect.height / 3));
                console.log('crect.height', crect.height, '=> effectiveHeight', effectiveHeight);
            } else {
                effectiveHeight = Math.max(10, Math.floor(window.innerHeight * 0.33));
                console.log('window.innerHeight', window.innerHeight, '=> effectiveHeight', effectiveHeight);
            }
        }
        // Target three lines with small line gap
        const targetLines = 7;
        const targetLineHeightFactor = 1.05;
        const usableHeight = effectiveHeight; // inner content area

        // Compute font size so exactly targetLines fit the container
        const fontSizePx = Math.max(10, Math.floor((usableHeight / targetLines) / targetLineHeightFactor));
        const lineHeightPx = Math.max(12, Math.round(fontSizePx * targetLineHeightFactor));
        console.log(usableHeight);
        // Apply computed font sizing to ensure exact fit
        container.style.fontSize = fontSizePx + 'px';
        container.style.lineHeight = lineHeightPx + 'px';

        // Measure average character width for the chosen font size
        const meas = document.createElement('span');
        meas.style.visibility = 'hidden';
        meas.style.position = 'absolute';
        meas.style.whiteSpace = 'nowrap';
        meas.style.fontFamily = compStyle.fontFamily;
        meas.style.fontSize = fontSizePx + 'px';
        meas.textContent = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        document.body.appendChild(meas);
        const avgCharWidth = meas.getBoundingClientRect().width / (meas.textContent?.length || 1);
        document.body.removeChild(meas);

        const charsPerLine = Math.max(8, Math.floor(containerWidth / avgCharWidth));
        const linesPerBox = targetLines; // we sized the font to fit 3 lines

        // Store into cache fields rather than remeasuring later
        this.fontSizePx = fontSizePx;
        this.lineHeightPx = lineHeightPx;
        this.charsPerLine = charsPerLine;
        this.linesPerBox = linesPerBox-2;
        this.lastOrientation = window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape';
    }

    private show() {
        if (!this.dialogEl) return;
        this.dialogEl.classList.add('visible');
        this.dialogEl.setAttribute('aria-hidden', 'false');
        // Block player controls while dialog is visible
        DialogManager.freeze_player = true;
        // reset gamepad press tracking to avoid accidental immediate advance
        this.prevGamepadFace1Pressed = false;
    }

    private hide() {
        if (!this.dialogEl) return;
        this.dialogEl.classList.remove('visible');
        this.dialogEl.setAttribute('aria-hidden', 'true');
        // Ensure player is unfrozen when dialog finishes
        DialogManager.freeze_player = false;
    }

    private showSegment(index: number) {
        if (!this.innerEl) return;
        this.innerEl.textContent = this.segments[index] ?? '';
        // update 'more' indicator
        if (this.moreEl) {
            if (this.currentSegment < this.segments.length - 1) {
                this.moreEl.style.opacity = '1';
            } else {
                this.moreEl.style.opacity = '0';
            }
        }
    }

    /** Advance to the next segment (internal) */
    private advance() {
        if (this.currentSegment < this.segments.length - 1) {
            this.currentSegment += 1;
            this.showSegment(this.currentSegment);
        } else {
            this.hide();
            this.segments = [];
            this.currentSegment = 0;
        }
    }

    /** Public method for external UI (e.g., B button) to advance */
    public next() {
        if (this.isVisible()) this.advance();
    }

    public setDialogue(dialogue_text: string) {
        // Store full text for potential re-segmentation on resize
        this.fullText = dialogue_text;
        // Segment the text to fit into the dialog box (lower third).
        if (!this.innerEl || !this.dialogEl) {
            // Fallback: just show entire text in a single segment
            this.segments = [dialogue_text];
            this.currentSegment = 0;
            this.show();
            this.showSegment(0);
            return;
        }

        // Ensure sizing is computed and only recompute when orientation changed
        const currentOrientation = window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape';
        if (this.lastOrientation === null || this.lastOrientation !== currentOrientation) {
            this.computeSizing();
        }

        // Re-read container width for segmentation fallback
        const container = this.innerEl;
        const compStyle = window.getComputedStyle(container);
        const containerWidth = container.clientWidth;

        // Build segments by words, ensuring we don't cut words when possible
        const charsPerLine = this.charsPerLine ?? Math.max(8, Math.floor(containerWidth / 8));
        const linesPerBox = this.linesPerBox;
        const maxChars = charsPerLine * linesPerBox;

        const words = dialogue_text.split(/(\s+)/); // keep whitespace
        const segments: string[] = [];
        let current = '';

        for (const w of words) {
            const test = current + w;
            if (test.length > maxChars && current.length > 0) {
                segments.push(current.trim());
                // If single word too large, split it
                if (w.length > maxChars) {
                    let part = '';
                    for (let i = 0; i < w.length; i++) {
                        part += w[i];
                        if (part.length >= maxChars) {
                            segments.push(part);
                            part = '';
                        }
                    }
                    current = part;
                } else {
                    current = w;
                }
            } else {
                current = test;
            }
        }
        if (current.trim().length > 0) segments.push(current.trim());

        this.segments = segments.length ? segments : [dialogue_text];
        this.currentSegment = 0;
        this.showSegment(0);
        this.show();
    }
}
