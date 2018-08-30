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
        var s = this.positions[(y * this.size) + x];
        s.x = x;
        s.y = y;
        return s;
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
//# sourceMappingURL=Board.js.map