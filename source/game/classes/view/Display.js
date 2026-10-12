var Display = (function () {
    function Display(canvas, game) {
        this.scale = 1;
        this.busy = false;
        this.runToken = 0;
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
        this.scale = this.canvas.clientWidth > 0 ? this.width / this.canvas.clientWidth : 1;
        this.padding = Math.max(1, Math.round(this.scale));
        this.overlay = this.buildBurstLayer();
        this.hideBurst();
    }
    Display.prototype.onClick = function (ex, ey) {
        var x = Math.floor((ex * this.scale - this.horizontalOffset) / this.step);
        var y = Math.floor((ey * this.scale - this.verticalOffset) / this.step);
        if (x < 0 || y < 0 || x >= this.game.size || y >= this.game.size) {
            return {
                "neighbors": {},
                "x": x,
                "y": y
            };
        }
        this.busy = true;
        var neighbors = {};
        this.game.onRemove(x, y, neighbors);
        this.draw();
        return {
            "neighbors": neighbors,
            "x": x,
            "y": y
        };
    };
    Display.prototype.setFont = function () {
        this.font_pixels = Math.floor(0.75 * this.scoreHeight);
        this.context.font = "bold " + this.font_pixels + "px Arial";
    };
    Display.prototype.setFontSmall = function () {
        this.font_pixels = Math.floor(0.25 * this.scoreHeight);
        this.context.font = "bold " + this.font_pixels + "px Arial";
    };
    Display.prototype.topCenterText = function (s) {
        this.setFont();
        var c = this.context;
        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";
        c.strokeText(s, this.half_width, this.font_pixels);
        c.fillText(s, this.half_width, this.font_pixels);
    };
    Display.prototype.middleCenterText = function (s) {
        var c = this.context;
        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";
        var y = this.canvas.height / 2 - this.font_pixels / 2;
        c.strokeText(s, this.half_width, y);
        c.fillText(s, this.half_width, y);
    };
    Display.prototype.bottomCenterText = function (s) {
        this.setFont();
        var c = this.context;
        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";
        var y = this.canvas.height - this.step;
        c.strokeText(s, this.half_width, y);
        c.fillText(s, this.half_width, y);
    };
    Display.addCommas = function (s) {
        var o = "";
        for (var i = s.length - 1; i >= 0; i--) {
            o = s[i] + o;
            if (i > 0 && (((s.length - i) % 3) == 0)) {
                o = "," + o;
            }
        }
        return o;
    };
    Display.prototype.showGameOver = function (message) {
        this.shadeBackGround();
        this.middleCenterText(message);
        this.bottomCenterText("Tap to Continue");
        this.updateScore();
    };
    Display.prototype.updateScore = function () {
        var s = this.game.score.toString();
        var o = Display.addCommas(s);
        this.topCenterText(o);
    };
    Display.prototype.drawTiles = function (rows) {
        if (rows === void 0) { rows = null; }
        for (var y = 0; y < this.board.size; y++) {
            for (var x = 0; x < this.board.size; x++) {
                var row = null;
                var hidden = false;
                if (rows !== null) {
                    var key = x + "," + y;
                    if (!rows.hasOwnProperty(key)) {
                        continue;
                    }
                    row = rows[key];
                    hidden = (row === null);
                }
                var t = new Tile(this.board.getPosition(x, y), this.board, this, row, hidden);
                t.draw();
            }
        }
    };
    Display.prototype.topLeftText = function (s) {
        this.setFont();
        var c = this.context;
        c.textAlign = "left";
        c.strokeText(s.toString(), this.horizontalOffset, this.font_pixels);
        c.fillText(s.toString(), this.horizontalOffset, this.font_pixels);
    };
    Display.prototype.updateMovesAvailable = function () {
        this.setFontSmall();
        var m = this.game.movesAvailable - this.game.movesUsed;
        this.topLeftText(m.toString() + " turns");
    };
    Display.prototype.clearBackGround = function () {
        var c = this.context;
        c.fillStyle = "#221100";
        c.fillRect(0, 0, this.width, this.height);
    };
    Display.prototype.shadeBackGround = function () {
        var c = this.context;
        c.fillStyle = "#221100";
        c.globalAlpha = 0.70;
        c.fillRect(0, 0, this.width, this.height);
        c.globalAlpha = 1;
    };
    Display.prototype.draw = function (rows) {
        if (rows === void 0) { rows = null; }
        this.half_width = this.horizontalOffset + (this.game.size * this.step / 2);
        this.setFont();
        this.clearBackGround();
        this.drawTiles(rows);
        this.updateScore();
        this.updateMovesAvailable();
    };
    Display.prototype.animateReveal = function (onDone) {
        var moves = [];
        var size = this.board.size;
        var index = 0;
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
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
    };
    Display.prototype.animateFall = function (plan, onDone) {
        var moves = [];
        for (var i = 0; i < plan.length; i++) {
            var m = plan[i];
            moves.push({
                x: m.x,
                from: m.from,
                to: m.to,
                delay: 0,
                duration: 140 + Math.round(18 * Math.abs(m.to - m.from)),
                hidden: false
            });
        }
        this.run(moves, onDone);
    };
    Display.prototype.stop = function () {
        this.runToken++;
        this.busy = false;
    };
    Display.prototype.run = function (moves, onDone) {
        var _this = this;
        this.busy = true;
        if (moves.length === 0) {
            this.draw();
            this.busy = false;
            onDone();
            return;
        }
        var total = 0;
        for (var i = 0; i < moves.length; i++) {
            var end = moves[i].delay + moves[i].duration;
            if (end > total) {
                total = end;
            }
        }
        var token = ++this.runToken;
        var started = -1;
        var frame = function (now) {
            if (token !== _this.runToken) {
                return;
            }
            if (started < 0) {
                started = now;
            }
            var t = now - started;
            var rows = {};
            for (var i = 0; i < moves.length; i++) {
                var m = moves[i];
                var p = (t - m.delay) / m.duration;
                var key = m.x + "," + m.to;
                if (p <= 0) {
                    if (m.hidden) {
                        rows[key] = null;
                        continue;
                    }
                    p = 0;
                }
                else if (p > 1) {
                    p = 1;
                }
                var eased = 1 - Math.pow(1 - p, 3);
                rows[key] = m.from + (m.to - m.from) * eased;
            }
            _this.draw(rows);
            if (t < total) {
                requestAnimationFrame(frame);
                return;
            }
            _this.draw();
            _this.busy = false;
            onDone();
        };
        requestAnimationFrame(frame);
    };
    Display.prototype.burst = function () {
        var rect = this.canvas.getBoundingClientRect();
        var css = 1 / this.scale;
        var span = this.game.size * this.step * css;
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
    };
    Display.prototype.hideBurst = function () {
        if (Display.layerTimer !== 0) {
            window.clearTimeout(Display.layerTimer);
            Display.layerTimer = 0;
        }
        this.overlay.className = "tc-burst";
    };
    Display.prototype.buildBurstLayer = function () {
        if (Display.layer !== null) {
            return Display.layer;
        }
        if (document.getElementById(Display.styleId) === null) {
            var style = document.createElement("style");
            style.id = Display.styleId;
            style.appendChild(document.createTextNode(".tc-burst{position:fixed;pointer-events:none;display:none;overflow:visible}" +
                ".tc-burst.on{display:block}" +
                ".tc-burst i{position:absolute;left:50%;top:50%;border-radius:50%;opacity:0;" +
                "will-change:transform,opacity;animation-name:tc-burst-fly;" +
                "animation-timing-function:cubic-bezier(.15,.55,.35,1);animation-fill-mode:both}" +
                "@keyframes tc-burst-fly{" +
                "0%{transform:translate(-50%,-50%) scale(.4);opacity:1}" +
                "100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.9);opacity:0}}"));
            document.head.appendChild(style);
        }
        var layer = document.createElement("div");
        layer.id = "tc-burst";
        layer.className = "tc-burst";
        var colors = this.game.colors;
        for (var i = 0; i < Display.burstParticles; i++) {
            var size = 8 + Util.getRandomInteger(16);
            var angle = Math.random() * 2 * Math.PI;
            var distance = 90 + Util.getRandomInteger(330);
            var particle = document.createElement("i");
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
    };
    Display.layer = null;
    Display.layerTimer = 0;
    Display.styleId = "tc-animation";
    Display.revealStagger = 9;
    Display.revealDrop = 170;
    Display.burstDuration = 900;
    Display.burstDelay = 60;
    Display.burstParticles = 48;
    return Display;
}());
//# sourceMappingURL=Display.js.map