var Coordinate = (function () {
    function Coordinate(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.x = new NumericProperty(x);
        this.y = new NumericProperty(y);
        this.z = new NumericProperty(z);
    }
    return Coordinate;
}());
//# sourceMappingURL=Coordinate.js.map