var Game = (function () {
    function Game(size, variations, randomize) {
        if (size === void 0) { size = 3; }
        if (variations === void 0) { variations = 3; }
        if (randomize === void 0) { randomize = true; }
        this.colors = [];
        this.movesAvailable = 20;
        this.movesUsed = 0;
        this.score = 0;
        this.size = size;
        this.variations = variations;
        this.randomize = randomize;
        this.symbols = [];
        this.board = new Board(size);
        this.blank = new Symbol(-1, ' ');
        this.initColors();
        this.getSymbols();
        this.populate();
    }
    Game.prototype.initColors = function () {
        this.colors = [];
        for (var i = 0; i < Game.palette.length; i++) {
            this.colors.push(Game.palette[i]);
        }
    };
    Game.prototype.getRandomSymbol = function () {
        var r = Util.getRandomInteger(this.variations);
        return this.symbols[r];
    };
    Game.prototype.populate = function () {
        var size = this.size;
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                this.board.setPosition(x, y, this.getRandomSymbol());
            }
        }
    };
    Game.randomCompare = function () {
        return 0.5 - Math.random();
    };
    Game.prototype.getSymbols = function () {
        var index = 0;
        for (var c = 0; c < 10; c++) {
            this.symbols.push(new Symbol(index++, c.toString()));
        }
        var base = "A".charCodeAt(0);
        for (var a = 0; a < 26; a++) {
            this.symbols.push(new Symbol(index++, String.fromCharCode(base + a)));
        }
        var base_lower = "a".charCodeAt(0);
        for (var a = 0; a < 26; a++) {
            this.symbols.push(new Symbol(index++, String.fromCharCode(base_lower + a)));
        }
        this.symbols.sort(Game.randomCompare);
        for (var i = 0; i < this.symbols.length; i++) {
            this.symbols[i].color = this.colors[i % this.colors.length];
        }
    };
    Game.prototype.moveDown = function () {
        var moved = 0;
        var b = this.board;
        for (var y = b.size - 1; y >= 0; y--) {
            for (var x = b.size - 1; x >= 0; x--) {
                var v = b.getPosition(x, y).value;
                if (v == -1) {
                    if (y > 0) {
                        b.setPosition(x, y, b.getPosition(x, y - 1));
                        b.setPosition(x, y - 1, this.blank);
                    }
                    else {
                        b.setPosition(x, y, this.getRandomSymbol());
                    }
                    moved++;
                }
            }
        }
        if (moved > 0) {
            this.moveDown();
        }
    };
    Game.prototype.fallPlan = function () {
        var plan = [];
        var size = this.size;
        var b = this.board;
        for (var x = 0; x < size; x++) {
            var rows = [];
            for (var y = size - 1; y >= 0; y--) {
                if (b.getPosition(x, y).value != -1) {
                    rows.push(y);
                }
            }
            var blanks = size - rows.length;
            for (var i = 0; i < rows.length; i++) {
                plan.push({
                    x: x, from: rows[i], to: size - 1 - i, spawned: false
                });
            }
            for (var i = 0; i < blanks; i++) {
                plan.push({
                    x: x, from: i - blanks, to: i, spawned: true
                });
            }
        }
        return plan;
    };
    Game.prototype.serialize = function () {
        var cells = "";
        for (var y = 0; y < this.size; y++) {
            for (var x = 0; x < this.size; x++) {
                var symbol = this.board.positions[(y * this.size) + x];
                if (symbol.value < 0) {
                    cells += ".";
                    continue;
                }
                var slot = this.symbols.indexOf(symbol);
                cells += (slot < 0 || slot >= this.variations) ? "." : slot.toString(36);
            }
        }
        var symbols = "";
        for (var i = 0; i < this.variations; i++) {
            symbols += this.symbols[i].character;
        }
        return JSON.stringify({
            version: 1,
            size: this.size,
            variations: this.variations,
            score: this.score,
            used: this.movesUsed,
            symbols: symbols,
            cells: cells
        });
    };
    Game.restore = function (state) {
        var data = JSON.parse(state);
        if (data.version !== 1 || data.symbols.length !== data.variations
            || data.cells.length !== data.size * data.size) {
            throw new Error("unreadable saved game");
        }
        var game = new Game(data.size, data.variations);
        for (var i = 0; i < data.symbols.length; i++) {
            game.symbols[i].character = data.symbols.charAt(i);
            game.symbols[i].value = i;
        }
        for (var y = 0; y < data.size; y++) {
            for (var x = 0; x < data.size; x++) {
                var code = data.cells.charAt((y * data.size) + x);
                game.board.setPosition(x, y, (code === ".")
                    ? game.blank
                    : game.symbols[parseInt(code, 36)]);
            }
        }
        game.score = data.score;
        game.movesUsed = data.used;
        return game;
    };
    Game.prototype.onRemove = function (x, y, neighbors) {
        var count = Object.keys(neighbors).length;
        var b = this.board;
        var key = x.toString() + "," + y.toString();
        if (neighbors.hasOwnProperty(key)) {
            return;
        }
        var v = b.getPosition(x, y);
        neighbors[key] = key;
        b.setPosition(x, y, this.blank);
        if (x < this.size - 1 && v === b.getPosition(x + 1, y)) {
            this.onRemove(x + 1, y, neighbors);
        }
        if (x > 0 && v === b.getPosition(x - 1, y)) {
            this.onRemove(x - 1, y, neighbors);
        }
        if (y < this.size - 1 && v === b.getPosition(x, y + 1)) {
            this.onRemove(x, y + 1, neighbors);
        }
        if (y > 0 && v === b.getPosition(x, y - 1)) {
            this.onRemove(x, y - 1, neighbors);
        }
        if (count == 0) {
            var n = Object.keys(neighbors).length;
            var s = Math.pow(2, n - 1);
            this.score += s;
            this.movesUsed++;
        }
    };
    Game.palette = [
        "rgb(178,44,78)",
        "rgb(180,85,26)",
        "rgb(138,108,16)",
        "rgb(76,122,34)",
        "rgb(30,122,94)",
        "rgb(31,110,156)",
        "rgb(59,75,181)",
        "rgb(119,64,158)"
    ];
    return Game;
}());
//# sourceMappingURL=Game.js.map