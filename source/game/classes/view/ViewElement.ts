class ViewElement {

    width: number = 0;
    height: number = 0;

    x: number = 0;
    y: number = 0;
    view: View;

    constructor(view: View) {
        this.view = view;
        this.x = view.cursor.x;
        this.y = view.cursor.y;
    }

    public draw() {

    }
}