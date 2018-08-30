var Board = (function () {
    function Board(size) {
        if (size === void 0) { size = 6; }
        this.blank = new Symbol(-1, ' ');
        this.positions = Array(size * size);
        this.size = size;
        this.padding = 3;
        this.clear();
    }
    Board.prototype.getPosition = function (x, y) {
        return this.positions[(y * this.size) + x];
    };
    Board.prototype.setPosition = function (x, y, symbol) {
        this.positions[(y * this.size) + x] = symbol;
    };
    Board.prototype.clear = function () {
        for (var y = 0; y < this.size; y++) {
            for (var x = 0; x < this.size; x++) {
                this.setPosition(x, y, this.blank);
            }
        }
    };
    return Board;
}());
var Display = (function () {
    function Display(canvas, game) {
        this.game = game;
        this.board = this.game.board;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.minimum = Math.min(this.width, this.height);
        this.step = (this.minimum / this.board.size);
        this.padding = 3;
    }
    Display.prototype.onClick = function (ex, ey) {
        var x = Math.floor(ex / this.step);
        var y = Math.floor(ey / this.step);
        this.game.onRemove(x, y, {});
        this.draw();
        return new Neighbor(x, y);
    };
    Display.prototype.draw = function () {
        var size = this.board.size;
        var c = this.context;
        c.fillStyle = "gray";
        c.fillRect(0, 0, this.width, this.height);
        c.fillStyle = "white";
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                var t = new Tile(this.board.getPosition(x, y), this.board, this);
                t.draw();
            }
        }
    };
    return Display;
}());
var DisplayConsole = (function () {
    function DisplayConsole() {
    }
    DisplayConsole.prototype.draw = function (b) {
        console.log(this.toString(b));
    };
    DisplayConsole.prototype.toString = function (b) {
        var output = [];
        for (var y = 0; y < b.size; y++) {
            var row = [];
            for (var x = 0; x < b.size; x++) {
                var p = b.getPosition(x, y);
                var c = p.character;
                row.push(c);
            }
            output.push(row.join(' '));
        }
        return output.join('\n') + '\n';
    };
    return DisplayConsole;
}());
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
        if (Object.hasOwnProperty(key)) {
            return;
        }
        var v = b.getPosition(x, y);
        neighbors[key] = v;
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
var Position = (function () {
    function Position(x, y, symbol) {
        if (symbol === void 0) { symbol = new Symbol(-1, ' '); }
        this.x = x;
        this.y = y;
        this.symbol = symbol;
        this.default = new Symbol(-1, ' ');
        this.clear();
    }
    Position.prototype.clear = function () {
        this.symbol = this.default;
    };
    return Position;
}());
var Symbol = (function () {
    function Symbol(value, character) {
        if (value === void 0) { value = -1; }
        if (character === void 0) { character = ' '; }
        this.value = value;
        this.character = character;
    }
    return Symbol;
}());
var Tile = (function () {
    function Tile(position, board, display) {
        this.position = position;
        this.board = board;
        this.display = display;
    }
    Tile.prototype.clear = function () {
        var c = this.display.context;
        var step = this.display.step;
        var cx = this.position.x * step;
        var cy = this.position.y * step;
        c.fillStyle = "grey";
        c.fillRect(cx, cy, step, step);
    };
    Tile.prototype.circle = function () {
        var c = this.display.context;
        var step = this.display.step;
        var padding = this.display.padding;
        var cx = this.position.x * step;
        var cy = this.position.y * step;
        c.beginPath();
        c.arc(cx + (step - padding) / 2, cy + (step - padding) / 2, step / 2 - padding, 0, 2 * Math.PI, false);
        c.fillStyle = 'white';
        c.fill();
    };
    Tile.prototype.text = function () {
        var step = this.display.step;
        var padding = this.display.padding;
        var cx = this.position.x * step;
        var cy = this.position.y * step;
        var c = this.display.context;
        var s = this.position.symbol.character;
        c.fillStyle = "black";
        c.font = (step * 0.6) + "px Arial";
        var mt = c.measureText(s);
        c.fillText(s, Math.floor(cx + ((step - padding) / 2) - (mt.width / 2)), Math.ceil(cy + (step * 0.7)));
    };
    Tile.prototype.draw = function () {
        var c = this.display.context;
        if (-1 === this.getSymbol().value) {
            this.clear(c);
        }
        else {
            this.circle();
            this.text();
        }
    };
    return Tile;
}());
var Util = (function () {
    function Util() {
    }
    Util.getRandomInteger = function (i) {
        if (i === void 0) { i = 10; }
        return Math.floor(Math.random() * i);
    };
    return Util;
}());
var d = new DisplayConsole();
var g = new Game(5, 3);
var X = new Symbol(0, 'X');
var Y = new Symbol(1, 'Y');
g.board.positions = [
    X, X, X, X, X,
    X, Y, X, Y, X,
    Y, Y, Y, Y, Y,
    Y, Y, Y, Y, Y,
    X, Y, X, Y, X,
    X, Y, X, Y, X
];
d.draw(g.board);
g.onRemove(5, 4, {});
d.draw(g.board);
g.moveDown();
d.draw(g.board);
var Neighbor = (function () {
    function Neighbor(x, y) {
        this.x = x;
        this.y = y;
    }
    return Neighbor;
}());
//# sourceMappingURL=all2.js.map