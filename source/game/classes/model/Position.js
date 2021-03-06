var Position = (function () {
    function Position(x, y, symbol) {
        if (symbol === void 0) { symbol = new Symbol(-1, ' '); }
        this.x = new GoalDrivenProperty(x);
        this.y = new GoalDrivenProperty(y);
        this.symbol = symbol;
        this.default = new Symbol(-1, ' ');
        this.clear();
    }
    Position.prototype.clear = function () {
        this.symbol = this.default;
    };
    return Position;
}());
//# sourceMappingURL=Position.js.map