var Sprite = (function () {
    function Sprite(frame, x, y, goal_x, goal_y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (goal_x === void 0) { goal_x = 0; }
        if (goal_y === void 0) { goal_y = 0; }
        this.frame = frame;
        this.position = new Coordinate(x, y, 0);
        this.direction = new Vector(goal_x, goal_y, 0);
    }
    Sprite.prototype.draw = function () {
    };
    return Sprite;
}());
//# sourceMappingURL=Sprite.js.map