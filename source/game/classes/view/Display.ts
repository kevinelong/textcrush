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

    constructor(canvas: HTMLCanvasElement, game: Game) {
        this.game = game;
        this.board = this.game.board;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.minimum = Math.min(this.width, this.height);
        this.scoreHeight = Math.floor(this.minimum / (this.board.size + 1));
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

        let x = Math.floor((ex * this.scale - this.horizontalOffset) / this.step);
        let y = Math.floor((ey * this.scale - this.verticalOffset) / this.step);

        if (x < 0 || y < 0 || x >= this.game.size || y >= this.game.size) {
            // The square the game draws in is 9 rows tall: the score line sits in the top one, and a
            // tap on the last pixel row lands just past the board. Those taps index nothing, so
            // ignore them - and in particular do not latch busy, which would freeze the board for
            // good, since every later tap is dropped while busy is set.
            return {
                "neighbors": {},
                "x": x,
                "y": y
            };
        }

        this.busy = true;

        let neighbors = {};
        this.game.onRemove(x, y, neighbors);
        this.draw();

        return {
            "neighbors": neighbors,
            "x": x,
            "y": y
        };
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
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";

        c.strokeText(s, this.half_width, this.font_pixels);
        c.fillText(s, this.half_width, this.font_pixels);
    }

    middleCenterText(s: string) {

        let c = this.context;

        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";
        let y = this.canvas.height / 2 - this.font_pixels / 2;

        c.strokeText(s, this.half_width, y);
        c.fillText(s, this.half_width, y);
    }

    bottomCenterText(s: string) {
        this.setFont();
        let c = this.context;

        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";
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

    showGameOver(message:string) {
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

                let t = new Tile(this.board.getPosition(x, y), this.board, this, row, hidden);
                t.draw();
            }
        }
    }

    topLeftText(s: string) {
        this.setFont();
        let c = this.context;

        c.textAlign = "left";

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
        this.drawTiles(rows);
        this.updateScore();

        this.updateMovesAvailable();

    }

    /** drops every tile of a freshly populated board in from just above the grid, one after another */
    animateReveal(onDone: () => void) {

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

        let moves: Array<AnimationMove> = [];

        for (let i = 0; i < plan.length; i++) {
            let m = plan[i];
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
