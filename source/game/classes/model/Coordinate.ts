class Coordinate {
    x: NumericProperty;
    y: NumericProperty;
    z: NumericProperty;

    constructor(x = 0, y = 0, z = 0) {
        this.x = new NumericProperty(x);
        this.y = new NumericProperty(y);
        this.z = new NumericProperty(z);
    }
}