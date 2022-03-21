class TextElement extends ViewElement {

    text: string;
    size: number;
    align: string;
    lines: Array<string> = [];


    constructor(view: View, text: string, align: string = "center") {
        super(view);

        this.text = text;
        this.size = this.view.fontSize;
        this.align = align;

        let c = this.view.context;
        // noinspection JSSuspiciousNameCombination
        this.height = c.measureText("W").width + 1;

        this.x = Math.floor(c.canvas.width / 2);

        this.splitLines(text);

        view.cursor.y += (this.height * 1.125) * this.lines.length;
    }


    splitLines(text: string) {

        let c = this.view.context;

        let overflow = [];

        let words = text.split(" ");
        this.width = c.measureText(text).width;

        let padding = this.view.padding.left + this.view.padding.right;
        let inner = this.view.canvas.width - padding;

        while (this.width > inner && words.length > 1) {
            overflow.push(words.pop());
            text = words.join(" ");
            this.width = c.measureText(text).width;
        }

        this.lines.push(text);

        if (overflow.length > 0) {
            this.splitLines(overflow.reverse().join(" "));
        }
    }


    drawText(text: string, y: number) {

        let c = this.view.context;
        c.globalAlpha = 1;

        c.lineWidth = this.size / 8 + 2;

        c.fillStyle = "white";
        c.strokeStyle = "black";
        c.lineJoin = "round";

        // @ts-ignore
        c.textAlign = this.align;

        c.strokeText(text, this.x, y);
        c.fillText(text, this.x, y);
    }


    draw() {
        for (let i = this.lines.length - 1; i >= 0; i--) {
            let o = this.lines.length - i - 1;
            let y = this.y + ((this.height * 1.125) * i);
            this.drawText(this.lines[i], y);
        }
    }

}
