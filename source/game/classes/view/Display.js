var Display = (function () {
    function Display(canvas, game, showHud) {
        if (showHud === void 0) { showHud = true; }
        this.scale = 1;
        this.busy = false;
        this.pressed = null;
        this.removed = [];
        this.floaters = [];
        this.turnPulseAt = 0;
        this.effectRunning = false;
        this.card = null;
        this.cardToken = 0;
        this.cardAlpha = 1;
        this.scoreShown = 0;
        this.scoreFrom = 0;
        this.scoreChangedAt = 0;
        this.scoreSeen = -1;
        this.effectToken = 0;
        this.finished = false;
        this.focused = null;
        this.reduceMotion = false;
        this.showHud = true;
        this.muted = false;
        this.helpVisible = false;
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
        if (this.helpVisible) {
            this.hideHelp();
            return {
                "neighbors": {},
                "x": -1,
                "y": -1
            };
        }
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
        this.card = { message: message, started: Date.now() };
        this.animateCard();
    };
    Display.prototype.playCardExit = function (done) {
        var _this = this;
        if (this.card === null) {
            done();
            return;
        }
        this.stopEffects();
        var token = ++this.cardToken;
        var started = Date.now();
        var frame = function () {
            if (token !== _this.cardToken) {
                return;
            }
            var p = Math.min(1, (Date.now() - started) / 160);
            _this.cardAlpha = 1 - p;
            _this.draw();
            if (p < 1) {
                requestAnimationFrame(frame);
                return;
            }
            _this.card = null;
            _this.cardAlpha = 1;
            done();
        };
        requestAnimationFrame(frame);
    };
    Display.prototype.animateCard = function () {
        var _this = this;
        this.stopEffects();
        var frame = function () {
            if (_this.card === null) {
                return;
            }
            _this.draw();
            if ((Date.now() - _this.card.started) < 4000) {
                requestAnimationFrame(frame);
            }
        };
        this.cardToken++;
        requestAnimationFrame(frame);
    };
    Display.prototype.stopEffects = function () {
        this.effectToken++;
        this.effectRunning = false;
    };
    Display.prototype.drawCard = function () {
        var c = this.context;
        var age = Date.now() - this.card.started;
        var lines = this.card.message.split("\n");
        var lineHeight = Math.floor(this.scoreHeight * 0.95);
        var top = (this.canvas.height / 2) - ((lineHeight * (lines.length - 1)) / 2);
        var alpha = this.cardAlpha;
        c.fillStyle = "#221100";
        c.globalAlpha = 0.70 * Math.min(1, age / 220) * alpha;
        c.fillRect(0, 0, this.width, this.height);
        c.globalAlpha = 1;
        c.textAlign = "center";
        this.setInk();
        for (var i = 0; i < lines.length; i++) {
            var arrival = Math.min(1, (age - (i * 90)) / 260);
            if (arrival <= 0) {
                continue;
            }
            var eased = 1 - Math.pow(1 - arrival, 3);
            var size = (i === 0) ? 0.75 : 0.42;
            var pop = (i === 0) ? 1 + (0.06 * Math.sin(Math.PI * arrival)) : 1;
            c.font = "bold " + Math.floor(this.scoreHeight * size * pop) + "px Arial";
            c.lineWidth = (i === 0) ? 6 : 3.5;
            c.globalAlpha = eased * alpha;
            c.strokeText(lines[i], this.half_width, top + (i * lineHeight) + ((1 - eased) * this.scoreHeight * 0.45));
            c.fillText(lines[i], this.half_width, top + (i * lineHeight) + ((1 - eased) * this.scoreHeight * 0.45));
            c.globalAlpha = 1;
        }
        var promptAt = (lines.length * 90) + 320;
        if (age <= promptAt) {
            return;
        }
        var beat = age - promptAt;
        var pulsing = beat < 3600;
        var wave = 0.75 + (0.25 * (0.5 + (0.5 * Math.cos(beat / 190))));
        c.font = "bold " + Math.floor(this.scoreHeight * 0.42) + "px Arial";
        c.lineWidth = 3.5;
        c.globalAlpha = (pulsing ? wave : 1) * alpha;
        c.strokeText("Tap to Continue", this.half_width, this.canvas.height - this.step);
        c.fillText("Tap to Continue", this.half_width, this.canvas.height - this.step);
        c.globalAlpha = 1;
    };
    Display.prototype.updateScore = function () {
        if (this.scoreSeen !== this.game.score) {
            this.scoreFrom = this.scoreShown;
            this.scoreChangedAt = Date.now();
            this.scoreSeen = this.game.score;
            this.tickEffects();
        }
        var age = (Date.now() - this.scoreChangedAt) / 250;
        if (age >= 1) {
            this.scoreShown = this.game.score;
        }
        else {
            var eased = 1 - Math.pow(1 - age, 2);
            this.scoreShown = Math.round(this.scoreFrom + ((this.game.score - this.scoreFrom) * eased));
        }
        this.topCenterText(Display.addCommas(this.scoreShown.toString()));
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
    Display.prototype.turnsLeft = function () {
        return this.game.movesAvailable - this.game.movesUsed;
    };
    Display.prototype.turnsInk = function () {
        var left = this.turnsLeft();
        if (left <= 2) {
            return "#ff7a5c";
        }
        if (left <= 5) {
            return "#f0b84a";
        }
        return "#ffeecc";
    };
    Display.prototype.pulseTurns = function () {
        this.turnPulseAt = Date.now();
        this.tickEffects();
    };
    Display.prototype.turnPulse = function () {
        if (this.turnPulseAt === 0) {
            return 1;
        }
        var age = (Date.now() - this.turnPulseAt) / 200;
        if (age >= 1) {
            return 1;
        }
        return 1 + (0.22 * Math.sin(Math.PI * age));
    };
    Display.prototype.drawTurnBar = function () {
        var c = this.context;
        var height = Math.max(2, Math.round(this.scoreHeight * 0.10));
        var span = this.game.size * this.step;
        var y = this.verticalOffset - height - 3;
        c.fillStyle = "#33200d";
        c.fillRect(this.horizontalOffset, y, span, height);
        c.fillStyle = this.turnsInk();
        c.fillRect(this.horizontalOffset, y, span * (this.turnsLeft() / this.game.movesAvailable), height);
    };
    Display.prototype.updateMovesAvailable = function () {
        var left = this.turnsLeft();
        var c = this.context;
        this.setFontSmall();
        c.textAlign = "left";
        c.strokeStyle = "#221100";
        c.fillStyle = this.turnsInk();
        c.lineJoin = "round";
        var label = left + (left === 1 ? " turn" : " turns");
        var x = this.horizontalOffset;
        var y = this.font_pixels;
        var scale = this.turnPulse();
        if (scale === 1) {
            c.strokeText(label, x, y);
            c.fillText(label, x, y);
        }
        else {
            c.save();
            c.translate(x, y);
            c.scale(scale, scale);
            c.strokeText(label, 0, 0);
            c.fillText(label, 0, 0);
            c.restore();
        }
        this.drawTurnBar();
    };
    Display.prototype.clearBackGround = function () {
        var c = this.context;
        c.fillStyle = "#221100";
        c.fillRect(0, 0, this.width, this.height);
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
        if (this.card !== null) {
            this.drawCard();
        }
        if (this.helpVisible) {
            this.drawHelp();
        }
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
        var help = this.helpBox();
        var hx = help[0] + (size / 2);
        c.strokeText("?", hx, cy);
        c.fillText("?", hx, cy);
    };
    Display.prototype.helpBox = function () {
        var size = this.scoreHeight;
        return [this.width - (2 * size), 0, size, size];
    };
    Display.prototype.hitHelp = function (ex, ey) {
        if (!this.showHud) {
            return false;
        }
        var box = this.helpBox();
        var x = ex * this.scale;
        var y = ey * this.scale;
        return x >= box[0] && x <= (box[0] + box[2]) && y >= box[1] && y <= (box[1] + box[3]);
    };
    Display.prototype.showHelp = function () {
        this.helpVisible = true;
        this.draw();
    };
    Display.prototype.hideHelp = function () {
        this.helpVisible = false;
        this.draw();
    };
    Display.prototype.drawHelp = function () {
        var c = this.context;
        var title = Math.floor(0.75 * this.scoreHeight);
        var body = Math.floor(0.40 * this.scoreHeight);
        var lineHeight = Math.floor(0.62 * this.scoreHeight);
        c.fillStyle = "#221100";
        c.globalAlpha = 0.90;
        c.fillRect(0, 0, this.width, this.height);
        c.globalAlpha = 1;
        c.textAlign = "center";
        this.setInk();
        c.font = "bold " + title + "px Arial";
        c.lineWidth = 5;
        c.strokeText("How to play", this.half_width, this.width * 0.20);
        c.fillText("How to play", this.half_width, this.width * 0.20);
        c.font = "bold " + body + "px Arial";
        c.lineWidth = 3.5;
        var y = this.width * 0.34;
        for (var i = 0; i < Display.rules.length; i++) {
            c.strokeText(Display.rules[i], this.half_width, y);
            c.fillText(Display.rules[i], this.half_width, y);
            y += lineHeight;
        }
        c.font = "bold " + body + "px Arial";
        c.strokeText("Tap anywhere to play", this.half_width, this.width * 0.93);
        c.fillText("Tap anywhere to play", this.half_width, this.width * 0.93);
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
        var duration = 45;
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
        if (this.effectRunning) {
            return;
        }
        this.effectRunning = true;
        var token = ++this.effectToken;
        var frame = function () {
            if (token !== _this.effectToken) {
                _this.effectRunning = false;
                return;
            }
            if (_this.busy) {
                _this.effectRunning = false;
                return;
            }
            _this.draw();
            if (_this.floaters.length > 0 || _this.turnPulse() !== 1 || _this.scoreShown !== _this.game.score) {
                requestAnimationFrame(frame);
                return;
            }
            _this.effectRunning = false;
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
        this.stopEffects();
        this.cardToken++;
        this.card = null;
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
    Display.rules = [
        "Tap a letter to clear it",
        "and the matching letters",
        "joined to it.",
        "A run of 2 scores 2,",
        "4 scores 8, 8 scores 128.",
        "Twenty turns, one per clear.",
        "Your best stays on this device."
    ];
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