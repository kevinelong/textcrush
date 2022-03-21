class ButtonElement extends ViewElement {

    text: string;
    background: string;
    size: number;
    align: string;


    constructor(view: View, text: string, background: string, align: string = "center") {
        super(view);

        this.text = text;
        this.background = background;
        this.size = this.view.fontSize;
        this.align = align;

        let c = this.view.context;

        // noinspection JSSuspiciousNameCombination
        this.height = Math.ceil(c.measureText("W").width * 1.5);
        this.width = c.measureText(text).width;

        this.x = Math.floor(c.canvas.width / 2);
        view.cursor.y += (this.height * 1.75);
    }


    roundedRect(x: number, y: number, width: number, height:number, radius: number) {
        let c = this.view.context;

        c.moveTo(x, y + radius);
        c.lineTo(x, y + height - radius);
        c.arcTo(x, y + height, x + radius, y + height, radius);
        c.lineTo(x + width - radius, y + height);
        c.arcTo(x + width, y + height, x + width, y + height - radius, radius);
        c.lineTo(x + width, y + radius);
        c.arcTo(x + width, y, x + width - radius, y, radius);
        c.lineTo(x + radius, y);
        c.arcTo(x, y, x, y + radius, radius);

    }

    buttonBackground() {

        let padding = this.view.padding.left + this.view.padding.right;
        let width = this.view.canvas.width - padding;
        let height = this.height;
        let radius: number = Math.ceil(height / 2);

        let c = this.view.context;

        let x = this.view.padding.left;
        let y = this.y - Math.ceil(this.height / 2);

        c.strokeStyle = "black";
        c.fillStyle = this.background;

        let lineWidth = this.size / 24;

        let outer = 6;
        let step = 2;

        for (let lw = outer; lw >= 0; lw -= step) {
            c.lineWidth = lineWidth + lw;

            c.beginPath();

            if ((lw % outer) != 0) {
                c.strokeStyle = "white";
            } else {
                c.strokeStyle = "black";
            }

            this.roundedRect(x, y, width, height, radius);

            c.stroke();
            c.fill();
        }


    }

    draw() {
        this.buttonBackground();
        let c = this.view.context;
        c.globalAlpha = 1;
        c.lineWidth = this.size / 8 + 2;

        c.fillStyle = "white";
        c.strokeStyle = "black";
        c.lineJoin = "round";

        // @ts-ignore
        c.textAlign = this.align;
        let y = this.y + Math.ceil(this.height * 0.2);
        c.strokeText(this.text, this.x, y);
        c.fillText(this.text, this.x, y);
    }
}
