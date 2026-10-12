interface AnimationMove {

    x: number;
    from: number;
    to: number;
    delay: number;
    duration: number;

    /** true while the tile has not started falling yet, so it is not drawn at all */
    hidden: boolean;
}

/** fractional row overrides keyed "x,y"; a null value means "not there yet" */
interface RowOverrides {
    [key: string]: number;
}

/** the neighbours map the model fills in, keyed "x,y" */
interface NeighborKeys {
    [key: string]: string;
}

/** a cell of the run that was just cleared, kept so the view can show it leaving */
interface RemovedTile {
    x: number;
    y: number;
    symbol: Symbol;
}

/** a "+16" that rises from where the run was scored and fades */
interface Floater {
    text: string;
    x: number;
    y: number;
    born: number;
}

class Display {

    board: Board;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    minimum: number;
    step: number;
    padding: number;
    game: Game;
    scoreHeight: number;
    horizontalOffset: number;
    verticalOffset: number;
    font_pixels: number;
    half_width: number;

    /** css pixels -> canvas pixels; the canvas is drawn at device density, taps arrive in css px */
    scale: number = 1;

    /** true while tiles are moving; input is ignored until the board is still */
    busy: boolean = false;

    /** the cell a finger is down on, so it can look pressed before the tap lands */
    private pressed: Neighbor = null;

    /** the run the last tap cleared, waiting to be drawn shrinking away */
    private removed: Array<RemovedTile> = [];

    private floaters: Array<Floater> = [];
    private effectToken: number = 0;

    /** set once the game is over, so a fading floater cannot repaint over the end card */
    private finished: boolean = false;

    /** the cell a keyboard or screen-reader user has focused, drawn with a ring */
    private focused: Neighbor = null;

    /** follow the system's motion preference: no deal-in, no fall, no pop, no float */
    reduceMotion: boolean = false;

    /** false when a wrapper draws the score line natively and the board keeps the whole square */
    showHud: boolean = true;

    /** the sound toggle drawn in the score line (the web build's control; wrappers have their own) */
    muted: boolean = false;

    private overlay: HTMLDivElement;
    private runToken: number = 0;
    private static layer: HTMLDivElement = null;
    private static layerTimer: number = 0;
    private static styleId: string = "tc-animation";

    private static revealStagger: number = 9;
    private static revealDrop: number = 170;
    private static burstDuration: number = 900;
    private static burstDelay: number = 60;
    private static burstParticles: number = 48;

    constructor(canvas: HTMLCanvasElement, game: Game, showHud: boolean = true) {
        this.game = game;
        this.board = this.game.board;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.minimum = Math.min(this.width, this.height);
        this.showHud = showHud;

        // With a native header the game keeps no room for a score line of its own, and the board takes
        // the whole square: the tiles come out an eighth larger.
        this.scoreHeight = showHud ? Math.floor(this.minimum / (this.board.size + 1)) : 0;
        this.verticalOffset = this.scoreHeight;
        this.horizontalOffset = (this.width - this.minimum) / 2;
        this.step = ((this.minimum - this.scoreHeight) / this.board.size);

        // The canvas carries one backing pixel per device pixel and is displayed at its css size, so
        // the layout below is in canvas pixels: taps arrive in css pixels and are scaled up, and the
        // 1px gap between tiles becomes one css pixel rather than one canvas pixel.
        this.scale = this.canvas.clientWidth > 0 ? this.width / this.canvas.clientWidth : 1;
        this.padding = Math.max(1, Math.round(this.scale));

        this.overlay = this.buildBurstLayer();
        this.hideBurst();
    }

    onClick(ex: number, ey: number) {

        let cell: Neighbor = this.cellAt(ex, ey);

        if (cell === null) {
            // The square the game draws in is 9 rows tall: the score line sits in the top one, and a
            // tap on the last pixel row lands just past the board. Those taps index nothing, so
            // ignore them - and in particular do not latch busy, which would freeze the board for
            // good, since every later tap is dropped while busy is set.
            return {
                "neighbors": {},
                "x": -1,
                "y": -1
            };
        }

        return this.onClickCell(cell.x, cell.y);
    }

    /** clears the run at a cell; the entry point for the board, the keyboard and a screen reader */
    onClickCell(x: number, y: number) {

        this.busy = true;

        // The run is remembered before it goes, because afterwards the board no longer has it and
        // the view wants to show it leaving rather than blinking out.
        let before = this.board.positions.slice();

        let neighbors: NeighborKeys = {};
        this.game.onRemove(x, y, neighbors);
        this.removed = this.captureRemoved(before);

        this.draw();

        return {
            "neighbors": neighbors,
            "x": x,
            "y": y
        };
    }

    /** the cell a css-space point lands on, or null when the point is not on the board */
    private cellAt(ex: number, ey: number): Neighbor {

        let x = Math.floor((ex * this.scale - this.horizontalOffset) / this.step);
        let y = Math.floor((ey * this.scale - this.verticalOffset) / this.step);

        if (x < 0 || y < 0 || x >= this.game.size || y >= this.game.size) {
            return null;
        }

        return new Neighbor(x, y);
    }

    /** what the cleared run looked like, so it can be drawn shrinking away */
    private captureRemoved(before: Array<Symbol>): Array<RemovedTile> {

        let out: Array<RemovedTile> = [];
        let size = this.board.size;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {

                let index = (y * size) + x;

                if (before[index].value != -1 && this.board.positions[index].value == -1) {
                    out.push({ x: x, y: y, symbol: before[index] });
                }
            }
        }

        return out;
    }

    /** a finger went down on a cell: show it pressed until it lifts */
    press(ex: number, ey: number) {

        if (this.busy) {
            return;
        }

        let cell = this.cellAt(ex, ey);

        if (cell === null) {
            this.releasePress();
            return;
        }

        if (this.pressed !== null && this.pressed.x === cell.x && this.pressed.y === cell.y) {
            return;
        }

        this.pressed = cell;
        this.draw();
    }

    releasePress() {

        if (this.pressed === null) {
            return;
        }

        this.pressed = null;
        this.draw();
    }

    setFont() {
        this.font_pixels = Math.floor(0.75 * this.scoreHeight);
        this.context.font = "bold " + this.font_pixels + "px Arial";
    }

    setFontSmall() {
        this.font_pixels = Math.floor(0.25 * this.scoreHeight);
        this.context.font = "bold " + this.font_pixels + "px Arial";
    }

    topCenterText(s: string) {
        this.setFont();
        let c = this.context;
        c.textAlign = "center";
        this.setInk();

        c.strokeText(s, this.half_width, this.font_pixels);
        c.fillText(s, this.half_width, this.font_pixels);
    }

    /**
     * Cream lettering outlined in the board's own colour.
     *
     * The HUD used to be drawn as #333333 with a #ffeecc outline, which measures 1.45:1 for the fill
     * against the board ground - the glyph interiors were effectively invisible and only the outline
     * carried the shape. This way round the fill is the legible part (15.98:1) and the outline just
     * separates it from the background.
     */
    private setInk() {

        let c = this.context;

        c.strokeStyle = "#221100";
        c.fillStyle = "#ffeecc";
        c.lineJoin = "round";
    }

    middleCenterText(message: string) {

        let c = this.context;
        let lines = message.split("\n");
        let big = Math.floor(0.75 * this.scoreHeight);
        let small = Math.floor(0.42 * this.scoreHeight);
        let lineHeight = Math.floor(this.scoreHeight * 0.95);

        // The message arrives with newlines in it. Drawn as a single line - which is what this used to
        // do - a 40-character line at 33 dp ran off both edges of a 393 px square, so the score was
        // cut off at each end. Stacked, it fits.
        c.textAlign = "center";
        this.setInk();

        let y = (this.canvas.height / 2) - ((lineHeight * (lines.length - 1)) / 2);

        for (let i = 0; i < lines.length; i++) {

            if (lines[i].length > 0) {
                c.font = "bold " + (i === 0 ? big : small) + "px Arial";
                c.lineWidth = i === 0 ? 6 : 3.5;

                c.strokeText(lines[i], this.half_width, y);
                c.fillText(lines[i], this.half_width, y);
            }

            y += lineHeight;
        }
    }

    bottomCenterText(s: string) {
        this.setFont();
        let c = this.context;

        c.textAlign = "center";
        this.setInk();
        let y = this.canvas.height - this.step;

        c.strokeText(s, this.half_width, y);
        c.fillText(s, this.half_width, y);
    }

    static addCommas(s: string) {
        let o = "";

        for (let i = s.length - 1; i >= 0; i--) {

            o = s[i] + o;

            if (i > 0 && (((s.length - i) % 3) == 0)) {
                o = "," + o;
            }
        }

        return o;
    }

    showGameOver(message: string) {

        // Nothing may repaint the board after this: the shade and the card are painted once, and a
        // fading "+16" would otherwise clear them a few frames later.
        this.finished = true;
        this.floaters = [];

        this.shadeBackGround();
        this.middleCenterText(message);
        this.bottomCenterText("Tap to Continue");
        this.updateScore();
    }

    updateScore() {
        let s = this.game.score.toString();
        let o = Display.addCommas(s);
        this.topCenterText(o);
    }

    drawTiles(rows: RowOverrides = null) {
        for (let y = 0; y < this.board.size; y++) {
            for (let x = 0; x < this.board.size; x++) {

                let row: number = null;
                let hidden = false;

                if (rows !== null) {

                    let key = x + "," + y;

                    if (!rows.hasOwnProperty(key)) {
                        continue;
                    }

                    row = rows[key];
                    hidden = (row === null);
                }

                let t = new Tile(this.board.getPosition(x, y), this.board, this, row, hidden, x);
                t.pressed = this.pressed !== null && this.pressed.x === x && this.pressed.y === y;
                t.focused = this.focused !== null && this.focused.x === x && this.focused.y === y;
                t.squashY = this.squashFor(x, y);
                t.draw();
            }
        }
    }

    topLeftText(s: string) {
        this.setFont();
        let c = this.context;

        c.textAlign = "left";
        // Explicitly, not inherited from whichever text was drawn last.
        this.setInk();

        c.strokeText(s.toString(), this.horizontalOffset, this.font_pixels);
        c.fillText(s.toString(), this.horizontalOffset, this.font_pixels);

    }

    updateMovesAvailable() {
        this.setFontSmall();
        let m = this.game.movesAvailable - this.game.movesUsed;
        this.topLeftText(m.toString() + " turns");
    }

    clearBackGround() {
        let c = this.context;
        c.fillStyle = "#221100";
        c.fillRect(0, 0, this.width, this.height);
    }

    shadeBackGround() {
        let c = this.context;
        c.fillStyle = "#221100";
        c.globalAlpha = 0.70;
        c.fillRect(0, 0, this.width, this.height);
        c.globalAlpha = 1;
    }

    draw(rows: RowOverrides = null) {

        this.half_width = this.horizontalOffset + (this.game.size * this.step / 2);

        this.setFont();

        this.clearBackGround();
        this.boardClip();
        this.drawTiles(rows);
        this.unclip();

        if (this.showHud) {
            this.updateScore();
            this.updateMovesAvailable();
            this.drawMute();
        }

        this.drawFloaters();
    }

    /** where the sound toggle sits: a square at the right end of the score line */
    private muteBox(): Array<number> {

        let size = this.scoreHeight;

        return [this.width - size, 0, size, size];
    }

    /** true when a css-space point is on the sound toggle */
    hitMute(ex: number, ey: number): boolean {

        if (!this.showHud) {
            return false;
        }

        let box = this.muteBox();
        let x = ex * this.scale;
        let y = ey * this.scale;

        return x >= box[0] && x <= (box[0] + box[2]) && y >= box[1] && y <= (box[1] + box[3]);
    }

    private drawMute() {

        let box = this.muteBox();
        let c = this.context;
        let size = box[2];
        let cx = box[0] + (size / 2);
        let cy = box[1] + (size * 0.62);

        c.textAlign = "center";
        c.font = "bold " + Math.floor(size * 0.5) + "px Arial";
        this.setInk();

        c.strokeText("\u266a", cx, cy);
        c.fillText("\u266a", cx, cy);

        if (this.muted) {
            // a slash across the note is unmistakable at this size and needs no second glyph
            c.beginPath();
            c.moveTo(cx - (size * 0.24), cy - (size * 0.22));
            c.lineTo(cx + (size * 0.24), cy + (size * 0.14));
            c.lineWidth = Math.max(2, size * 0.07);
            c.strokeStyle = "#221100";
            c.stroke();
            c.lineWidth = Math.max(1, size * 0.035);
            c.strokeStyle = "#ffeecc";
            c.stroke();
        }
    }

    /** a keyboard or screen-reader user moved to a cell: ring it, so sighted keyboard users can see */
    focusCell(cell: Neighbor) {

        this.focused = cell;
        this.draw();
    }

    /**
     * Tiles enter from above the top row, which is also where the score line is drawn: clipped to the
     * board, they cannot paint over it. (Measured before this: a refill tile crossed the "20 turns"
     * readout for 170 ms on every deal-in.)
     */
    private boardClip() {

        let c = this.context;

        c.save();
        c.beginPath();
        c.rect(
            this.horizontalOffset,
            this.verticalOffset,
            this.game.size * this.step,
            this.game.size * this.step
        );
        c.clip();
    }

    private unclip() {
        this.context.restore();
    }

    /** drops every tile of a freshly populated board in from just above the grid, one after another */
    animateReveal(onDone: () => void) {

        if (this.reduceMotion) {
            this.draw();
            onDone();
            return;
        }

        let moves: Array<AnimationMove> = [];
        let size = this.board.size;
        let index = 0;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {

                if (this.board.getPosition(x, y).value == -1) {
                    index++;
                    continue;
                }

                moves.push({
                    x: x,
                    from: y - 1,
                    to: y,
                    delay: index * Display.revealStagger,
                    duration: Display.revealDrop,
                    hidden: true
                });

                index++;
            }
        }

        this.run(moves, onDone);
    }

    /**
     * Draws the fall described by game.fallPlan(), which must already have been
     * applied with game.moveDown(). Each cell is redrawn at its own interpolated row,
     * so the frame is always complete: every cell of the board is in the plan.
     */
    animateFall(plan: Array<FallMove>, onDone: () => void) {

        if (this.reduceMotion) {
            this.draw();
            onDone();
            return;
        }

        let moves: Array<AnimationMove> = [];

        // What the settle needs: which destination cells' tiles moved, and how far. Cells that did
        // not move are absent, and that is what keeps the landing squash off them.
        this.fallDistance = {};

        for (let i = 0; i < plan.length; i++) {
            let m = plan[i];

            this.fallDistance[m.x + "," + m.to] = Math.abs(m.to - m.from);

            moves.push({
                x: m.x,
                from: m.from,
                to: m.to,
                delay: 0,
                // short falls stay snappy; long ones get more time but still land together
                duration: 140 + Math.round(18 * Math.abs(m.to - m.from)),
                hidden: false
            });
        }

        this.run(moves, onDone);
    }

    /** how far each destination cell's tile fell in the last move, keyed "x,y" */
    private fallDistance: RowOverrides = {};

    /** 0..1 through the settle; 1 means nothing is squashing */
    private settleProgress: number = 1;

    /**
     * How much this cell's tile is squashed right now.
     *
     * Only tiles that actually fell squash, and the amount follows the distance they fell: a single
     * bubble coming out nudges the few tiles above it, a full column collapse thuds. Applying one
     * squash to the whole board (which is what this did first) meant a one-bubble tap visibly
     * bounced all 64 tiles.
     */
    private squashFor(x: number, y: number): number {

        if (this.settleProgress >= 1) {
            return 1;
        }

        let distance = this.fallDistance[x + "," + y];

        if (!distance) {
            return 1;
        }

        let amplitude = Math.min(0.11, 0.035 + (0.018 * distance));

        return 1 - (amplitude * Math.sin(Math.PI * this.settleProgress));
    }

    /** the board taking the impact of the fall: a short squash anchored at each tile's bottom */
    animateSettle(onDone: () => void) {

        if (this.reduceMotion) {
            this.draw();
            onDone();
            return;
        }

        let token = ++this.runToken;
        let started = -1;

        // 45 ms: the squash is meant to be felt, not watched. At 90 ms it read as a slow bob rather
        // than the board landing, and the amplitude below is unchanged, so this is the same bounce
        // at twice the speed.
        let duration = 45;

        let frame = (now: number) => {

            if (token !== this.runToken) {
                return;
            }

            if (started < 0) {
                started = now;
            }

            let p = Math.min(1, (now - started) / duration);

            this.settleProgress = p;
            this.draw();

            if (p < 1) {
                requestAnimationFrame(frame);
                return;
            }

            this.settleProgress = 1;
            this.draw();
            onDone();
        };

        requestAnimationFrame(frame);
    }

    /** the cleared run shrinking away where it stood, before the fall */
    animatePop(onDone: () => void) {

        let tiles = this.removed;
        this.removed = [];

        if (this.reduceMotion) {
            this.draw();
            onDone();
            return;
        }

        if (tiles.length === 0) {
            onDone();
            return;
        }

        let token = ++this.runToken;
        let started = -1;
        let duration = 110;

        let frame = (now: number) => {

            if (token !== this.runToken) {
                return;
            }

            if (started < 0) {
                started = now;
            }

            let p = Math.min(1, (now - started) / duration);

            this.draw();

            for (let i = 0; i < tiles.length; i++) {

                let t = tiles[i];
                let tile = new Tile(t.symbol, this.board, this, t.y, false, t.x);

                // a short swell and then away, so the run reads as crushed rather than deleted
                tile.scale = Math.max(0, 1 + (0.18 * Math.sin(Math.PI * p)) - (p * p));
                tile.alpha = 1 - p;
                tile.draw();
            }

            if (p < 1) {
                requestAnimationFrame(frame);
                return;
            }

            this.draw();
            onDone();
        };

        requestAnimationFrame(frame);
    }

    /** "+16" rising from the run that scored it */
    scoreFloat(neighbors: NeighborKeys, gained: number) {

        let keys = Object.keys(neighbors);

        if (keys.length === 0 || gained <= 0) {
            return;
        }

        let sx = 0;
        let sy = 0;

        for (let i = 0; i < keys.length; i++) {
            let parts = keys[i].split(",");
            sx += parseInt(parts[0], 10);
            sy += parseInt(parts[1], 10);
        }

        let cx = this.horizontalOffset + ((sx / keys.length) + 0.5) * this.step;
        let cy = this.verticalOffset + ((sy / keys.length) + 0.5) * this.step;

        this.float("+" + Display.addCommas(gained.toString()), cx, cy);
    }

    private float(text: string, cx: number, cy: number) {

        if (this.finished || this.reduceMotion) {
            return;
        }

        this.floaters.push({ text: text, x: cx, y: cy, born: Date.now() });

        this.tickEffects();
    }

    /** keeps drawing while anything is still fading, without holding up the next tap */
    private tickEffects() {

        let token = ++this.effectToken;

        let frame = () => {

            if (token !== this.effectToken || this.finished) {
                return;
            }

            if (this.busy) {
                // an animation is drawing these frames already, and calls back here when it finishes
                return;
            }

            this.draw();

            if (this.floaters.length > 0) {
                requestAnimationFrame(frame);
            }
        };

        requestAnimationFrame(frame);
    }

    private drawFloaters() {

        if (this.floaters.length === 0) {
            return;
        }

        let c = this.context;
        let now = Date.now();
        let live: Array<Floater> = [];

        c.textAlign = "center";
        c.font = "bold " + Math.floor(this.scoreHeight * 0.5) + "px Arial";
        c.lineWidth = 4;
        c.strokeStyle = "#221100";
        c.fillStyle = "#ffeecc";

        for (let i = 0; i < this.floaters.length; i++) {

            let f = this.floaters[i];
            let age = (now - f.born) / 600;

            if (age >= 1) {
                continue;
            }

            live.push(f);

            let y = f.y - (age * this.step);

            c.globalAlpha = 1 - age;
            c.strokeText(f.text, f.x, y);
            c.fillText(f.text, f.x, y);
            c.globalAlpha = 1;
        }

        this.floaters = live;
    }

    /** drops the running animation; its completion callback is not called */
    stop() {
        this.runToken++;
        this.busy = false;
    }

    private run(moves: Array<AnimationMove>, onDone: () => void) {

        this.busy = true;

        if (moves.length === 0) {
            this.draw();
            this.busy = false;
            onDone();
            return;
        }

        let total = 0;

        for (let i = 0; i < moves.length; i++) {
            let end = moves[i].delay + moves[i].duration;
            if (end > total) {
                total = end;
            }
        }

        let token = ++this.runToken;
        let started = -1;

        let frame = (now: number) => {

            if (token !== this.runToken) {
                return;
            }

            if (started < 0) {
                started = now;
            }

            let t = now - started;
            let rows: RowOverrides = {};

            for (let i = 0; i < moves.length; i++) {

                let m = moves[i];
                let p = (t - m.delay) / m.duration;
                let key = m.x + "," + m.to;

                if (p <= 0) {
                    if (m.hidden) {
                        rows[key] = null;
                        continue;
                    }
                    p = 0;
                } else if (p > 1) {
                    p = 1;
                }

                let eased = 1 - Math.pow(1 - p, 3);

                rows[key] = m.from + (m.to - m.from) * eased;
            }

            this.draw(rows);

            if (t < total) {
                requestAnimationFrame(frame);
                return;
            }

            this.draw();
            this.busy = false;
            onDone();

            // anything still fading (a "+16") keeps going now that the board is still again
            this.tickEffects();
        };

        requestAnimationFrame(frame);
    }

    /** one burst of particles over the board, drawn by the compositor: no per-frame script */
    burst() {

        let rect = this.canvas.getBoundingClientRect();

        // The game's geometry is in canvas pixels; the burst layer is positioned in css pixels.
        let css = 1 / this.scale;
        let span = this.game.size * this.step * css;

        this.overlay.style.left = (rect.left + this.horizontalOffset * css) + "px";
        this.overlay.style.top = (rect.top + this.verticalOffset * css) + "px";
        this.overlay.style.width = span + "px";
        this.overlay.style.height = span + "px";

        this.overlay.className = "tc-burst";
        void this.overlay.offsetWidth;
        this.overlay.className = "tc-burst on";

        if (Display.layerTimer !== 0) {
            window.clearTimeout(Display.layerTimer);
        }

        Display.layerTimer = window.setTimeout(function () {
            Display.layerTimer = 0;
            Display.layer.className = "tc-burst";
        }, Display.burstDuration + Display.burstDelay + 200);
    }

    private hideBurst() {

        if (Display.layerTimer !== 0) {
            window.clearTimeout(Display.layerTimer);
            Display.layerTimer = 0;
        }

        this.overlay.className = "tc-burst";
    }

    private buildBurstLayer(): HTMLDivElement {

        if (Display.layer !== null) {
            return Display.layer;
        }

        if (document.getElementById(Display.styleId) === null) {

            let style = document.createElement("style");
            style.id = Display.styleId;

            style.appendChild(document.createTextNode(
                ".tc-burst{position:fixed;pointer-events:none;display:none;overflow:visible}" +
                ".tc-burst.on{display:block}" +
                ".tc-burst i{position:absolute;left:50%;top:50%;border-radius:50%;opacity:0;" +
                "will-change:transform,opacity;animation-name:tc-burst-fly;" +
                "animation-timing-function:cubic-bezier(.15,.55,.35,1);animation-fill-mode:both}" +
                "@keyframes tc-burst-fly{" +
                "0%{transform:translate(-50%,-50%) scale(.4);opacity:1}" +
                "100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.9);opacity:0}}"
            ));

            document.head.appendChild(style);
        }

        let layer = document.createElement("div");
        layer.id = "tc-burst";
        layer.className = "tc-burst";

        let colors = this.game.colors;

        for (let i = 0; i < Display.burstParticles; i++) {

            let size = 8 + Util.getRandomInteger(16);
            let angle = Math.random() * 2 * Math.PI;
            let distance = 90 + Util.getRandomInteger(330);
            let particle = document.createElement("i");

            particle.style.width = size + "px";
            particle.style.height = size + "px";
            particle.style.background = colors[Util.getRandomInteger(colors.length)];

            particle.style.setProperty("--dx", Math.round(Math.cos(angle) * distance) + "px");
            particle.style.setProperty("--dy", Math.round(Math.sin(angle) * distance) + "px");

            particle.style.animationDuration =
                (Display.burstDuration - 120 + Util.getRandomInteger(240)) + "ms";
            particle.style.animationDelay = Util.getRandomInteger(Display.burstDelay) + "ms";

            layer.appendChild(particle);
        }

        document.body.appendChild(layer);

        Display.layer = layer;

        return layer;
    }

}
