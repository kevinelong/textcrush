class Sprite {

    position: Coordinate;
    direction: Vector;
    frame: ImageData;

    constructor(frame: ImageData, x: number = 0, y: number = 0, goal_x: number = 0, goal_y: number = 0) {
        this.frame = frame;
        this.position = new Coordinate(x, y, 0);
        this.direction = new Vector(goal_x, goal_y, 0);
    }
    //
    // step(): number {
    //     this.position.x += this.vector.x;
    //     this.position.y += this.vector.y;
    //     this.position.z += this.vector.z;
    // }

    draw() {

    }
}