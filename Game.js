var Game = (function () {
    function Game(size, variations, randomize) {
        if (size === void 0) { size = 3; }
        if (variations === void 0) { variations = 3; }
        if (randomize === void 0) { randomize = true; }
        this.size = size;
        this.variations = variations;
        this.randomize = randomize;
        this.symbols = [];
        this.board = new Board(size);
        this.blank = new Symbol(-1, ' ');
        this.getSymbols();
        this.populate();
    }
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
    Game.prototype.onRemove = function (x, y, neighbors) {
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
    };
    return Game;
}());
//# sourceMappingURL=Game.js.map