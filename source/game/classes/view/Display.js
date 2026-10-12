var Display = (function () {
    function Display(canvas, game, showHud) {
        if (showHud === void 0) { showHud = true; }
        this.scale = 1;
        this.busy = false;
        this.pressed = null;
        this.removed = [];
        this.floaters = [];
        this.effectToken = 0;
        this.finished = false;
        this.focused = null;
        this.reduceMotion = false;
        this.showHud = true;
        this.muted = false;
        this.runToken = 0;
        this.fallDistance = {};
        this.settleProgress = 1;
        this.game = game;
        this.board = this.game.board;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.minimum = Math.min(this.width, this.height);
        this.showHud = showHud;
        this.scoreHeight = showHud ? Math.floor(this.minimum / (this.board.size + 1)) : 0;
        this.verticalOffset = this.scoreHeight;
        this.horizontalOffset = (this.width - this.minimum) / 2;
        this.step = ((this.minimum - this.scoreHeight) / this.board.size);
        this.scale = this.canvas.clientWidth > 0 ? this.width / this.canvas.clientWidth : 1;
        this.padding = Math.max(1, Math.round(this.scale));
        this.overlay = this.buildBurstLayer();
        this.hideBurst();
    }
    Display.prototype.onClick = function (ex, ey) {
        var cell = this.cellAt(ex, ey);
        if (cell === null) {
            return {
                "neighbors": {},
                "x": -1,
                "y": -1
            };
        }
        return this.onClickCell(cell.x, cell.y);
    };
    Display.prototype.onClickCell = function (x, y) {
        this.busy = true;
        var before = this.board.positions.slice();
        var neighbors = {};
        this.game.onRemove(x, y, neighbors);
        this.removed = this.captureRemoved(before);
        this.draw();
        return {
            "neighbors": neighbors,
            "x": x,
            "y": y
        };
    };
    Display.prototype.cellAt = function (ex, ey) {
        var x = Math.floor((ex * this.scale - this.horizontalOffset) / this.step);
        var y = Math.floor((ey * this.scale - this.verticalOffset) / this.step);
        if (x < 0 || y < 0 || x >= this.game.size || y >= this.game.size) {
            return null;
        }
        return new Neighbor(x, y);
    };
    Display.prototype.captureRemoved = function (before) {
        var out = [];
        var size = this.board.size;
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                var index = (y * size) + x;
                if (before[index].value != -1 && this.board.positions[index].value == -1) {
                    out.push({ x: x, y: y, symbol: before[index] });
                }
            }
        }
        return out;
    };
    Display.prototype.press = function (ex, ey) {
        if (this.busy) {
            return;
        }
        var cell = this.cellAt(ex, ey);
        if (cell === null) {
            this.releasePress();
            return;
        }
        if (this.pressed !== null && this.pressed.x === cell.x && this.pressed.y === cell.y) {
            return;
        }
        this.pressed = cell;
        this.draw();
    };
    Display.prototype.releasePress = function () {
        if (this.pressed === null) {
            return;
        }
        this.pressed = null;
        this.draw();
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
        this.setInk();
        c.strokeText(s, this.half_width, this.font_pixels);
        c.fillText(s, this.half_width, this.font_pixels);
    };
    Display.prototype.setInk = function () {
        var c = this.context;
        c.strokeStyle = "#221100";
        c.fillStyle = "#ffeecc";
        c.lineJoin = "round";
    };
    Display.prototype.middleCenterText = function (message) {
        var c = this.context;
        var lines = message.split("\n");
        var big = Math.floor(0.75 * this.scoreHeight);
        var small = Math.floor(0.42 * this.scoreHeight);
        var lineHeight = Math.floor(this.scoreHeight * 0.95);
        c.textAlign = "center";
        this.setInk();
        var y = (this.canvas.height / 2) - ((lineHeight * (lines.length - 1)) / 2);
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].length > 0) {
                c.font = "bold " + (i === 0 ? big : small) + "px Arial";
                c.lineWidth = i === 0 ? 6 : 3.5;
                c.strokeText(lines[i], this.half_width, y);
                c.fillText(lines[i], this.half_width, y);
            }
            y += lineHeight;
        }
    };
    Display.prototype.bottomCenterText = function (s) {
        this.setFont();
        var c = this.context;
        c.textAlign = "center";
        this.setInk();
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
        this.finished = true;
        this.floaters = [];
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
                var t = new Tile(this.board.getPosition(x, y), this.board, this, row, hidden, x);
                t.pressed = this.pressed !== null && this.pressed.x === x && this.pressed.y === y;
                t.focused = this.focused !== null && this.focused.x === x && this.focused.y === y;
                t.squashY = this.squashFor(x, y);
                t.draw();
            }
        }
    };
    Display.prototype.topLeftText = function (s) {
        this.setFont();
        var c = this.context;
        c.textAlign = "left";
        this.setInk();
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
        this.boardClip();
        this.drawTiles(rows);
        this.unclip();
        if (this.showHud) {
            this.updateScore();
            this.updateMovesAvailable();
            this.drawMute();
        }
        this.drawFloaters();
    };
    Display.prototype.muteBox = function () {
        var size = this.scoreHeight;
        return [this.width - size, 0, size, size];
    };
    Display.prototype.hitMute = function (ex, ey) {
        if (!this.showHud) {
            return false;
        }
        var box = this.muteBox();
        var x = ex * this.scale;
        var y = ey * this.scale;
        return x >= box[0] && x <= (box[0] + box[2]) && y >= box[1] && y <= (box[1] + box[3]);
    };
    Display.prototype.drawMute = function () {
        var box = this.muteBox();
        var c = this.context;
        var size = box[2];
        var cx = box[0] + (size / 2);
        var cy = box[1] + (size * 0.62);
        c.textAlign = "center";
        c.font = "bold " + Math.floor(size * 0.5) + "px Arial";
        this.setInk();
        c.strokeText("\u266a", cx, cy);
        c.fillText("\u266a", cx, cy);
        if (this.muted) {
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
    };
    Display.prototype.focusCell = function (cell) {
        this.focused = cell;
        this.draw();
    };
    Display.prototype.boardClip = function () {
        var c = this.context;
        c.save();
        c.beginPath();
        c.rect(this.horizontalOffset, this.verticalOffset, this.game.size * this.step, this.game.size * this.step);
        c.clip();
    };
    Display.prototype.unclip = function () {
        this.context.restore();
    };
    Display.prototype.animateReveal = function (onDone) {
        if (this.reduceMotion) {
            this.draw();
            onDone();
            return;
        }
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
        if (this.reduceMotion) {
            this.draw();
            onDone();
            return;
        }
        var moves = [];
        this.fallDistance = {};
        for (var i = 0; i < plan.length; i++) {
            var m = plan[i];
            this.fallDistance[m.x + "," + m.to] = Math.abs(m.to - m.from);
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
    Display.prototype.squashFor = function (x, y) {
        if (this.settleProgress >= 1) {
            return 1;
        }
        var distance = this.fallDistance[x + "," + y];
        if (!distance) {
            return 1;
        }
        var amplitude = Math.min(0.11, 0.035 + (0.018 * distance));
        return 1 - (amplitude * Math.sin(Math.PI * this.settleProgress));
    };
    Display.prototype.animateSettle = function (onDone) {
        var _this = this;
        if (this.reduceMotion) {
            this.draw();
            onDone();
            return;
        }
        var token = ++this.runToken;
        var started = -1;
        var duration = 90;
        var frame = function (now) {
            if (token !== _this.runToken) {
                return;
            }
            if (started < 0) {
                started = now;
            }
            var p = Math.min(1, (now - started) / duration);
            _this.settleProgress = p;
            _this.draw();
            if (p < 1) {
                requestAnimationFrame(frame);
                return;
            }
            _this.settleProgress = 1;
            _this.draw();
            onDone();
        };
        requestAnimationFrame(frame);
    };
    Display.prototype.animatePop = function (onDone) {
        var _this = this;
        var tiles = this.removed;
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
        var token = ++this.runToken;
        var started = -1;
        var duration = 110;
        var frame = function (now) {
            if (token !== _this.runToken) {
                return;
            }
            if (started < 0) {
                started = now;
            }
            var p = Math.min(1, (now - started) / duration);
            _this.draw();
            for (var i = 0; i < tiles.length; i++) {
                var t = tiles[i];
                var tile = new Tile(t.symbol, _this.board, _this, t.y, false, t.x);
                tile.scale = Math.max(0, 1 + (0.18 * Math.sin(Math.PI * p)) - (p * p));
                tile.alpha = 1 - p;
                tile.draw();
            }
            if (p < 1) {
                requestAnimationFrame(frame);
                return;
            }
            _this.draw();
            onDone();
        };
        requestAnimationFrame(frame);
    };
    Display.prototype.scoreFloat = function (neighbors, gained) {
        var keys = Object.keys(neighbors);
        if (keys.length === 0 || gained <= 0) {
            return;
        }
        var sx = 0;
        var sy = 0;
        for (var i = 0; i < keys.length; i++) {
            var parts = keys[i].split(",");
            sx += parseInt(parts[0], 10);
            sy += parseInt(parts[1], 10);
        }
        var cx = this.horizontalOffset + ((sx / keys.length) + 0.5) * this.step;
        var cy = this.verticalOffset + ((sy / keys.length) + 0.5) * this.step;
        this.float("+" + Display.addCommas(gained.toString()), cx, cy);
    };
    Display.prototype.float = function (text, cx, cy) {
        if (this.finished || this.reduceMotion) {
            return;
        }
        this.floaters.push({ text: text, x: cx, y: cy, born: Date.now() });
        this.tickEffects();
    };
    Display.prototype.tickEffects = function () {
        var _this = this;
        var token = ++this.effectToken;
        var frame = function () {
            if (token !== _this.effectToken || _this.finished) {
                return;
            }
            if (_this.busy) {
                return;
            }
            _this.draw();
            if (_this.floaters.length > 0) {
                requestAnimationFrame(frame);
            }
        };
        requestAnimationFrame(frame);
    };
    Display.prototype.drawFloaters = function () {
        if (this.floaters.length === 0) {
            return;
        }
        var c = this.context;
        var now = Date.now();
        var live = [];
        c.textAlign = "center";
        c.font = "bold " + Math.floor(this.scoreHeight * 0.5) + "px Arial";
        c.lineWidth = 4;
        c.strokeStyle = "#221100";
        c.fillStyle = "#ffeecc";
        for (var i = 0; i < this.floaters.length; i++) {
            var f = this.floaters[i];
            var age = (now - f.born) / 600;
            if (age >= 1) {
                continue;
            }
            live.push(f);
            var y = f.y - (age * this.step);
            c.globalAlpha = 1 - age;
            c.strokeText(f.text, f.x, y);
            c.fillText(f.text, f.x, y);
            c.globalAlpha = 1;
        }
        this.floaters = live;
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
            _this.tickEffects();
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