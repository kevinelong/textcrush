class View {

    context: CanvasRenderingContext2D;
    padding: Spacing;
    foregroundColor: string;
    backgroundColor: string;
    elements: Array<ViewElement> = [];
    canvas: HTMLCanvasElement;
    fontSize: number;

    public cursor: Point;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        let p = canvas.height / 25;
        this.padding = new Spacing(p, p, p, p);
        this.cursor = new Point(this.padding.left, this.padding.top);
        this.foregroundColor = "rgb(208,208,208)";
        this.backgroundColor = "rgb(128,128,128)";
        this.fontSize = p;
        this.setFont();
    }

    public background() {

        let c = this.context;

        c.fillStyle = this.backgroundColor;
        c.globalAlpha = 1;

        c.fillRect(
            0,
            0,
            c.canvas.width,
            c.canvas.height
        )
    }

    public add(element: ViewElement) {
        this.elements.push(element);
    }

    public draw() {
        this.background();
        this.elements.map((e: ViewElement) => e.draw());
    }

    setFont() {
        this.context.font = "bold " + this.fontSize + "px Arial";
    }

}