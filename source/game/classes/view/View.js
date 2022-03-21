var View = (function () {
    function View(canvas) {
        this.elements = [];
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        var p = canvas.height / 25;
        this.padding = new Spacing(p, p, p, p);
        this.cursor = new Point(this.padding.left, this.padding.top);
        this.foregroundColor = "rgb(208,208,208)";
        this.backgroundColor = "rgb(128,128,128)";
        this.fontSize = p;
        this.setFont();
    }
    View.prototype.background = function () {
        var c = this.context;
        c.fillStyle = this.backgroundColor;
        c.globalAlpha = 1;
        c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    };
    View.prototype.add = function (element) {
        this.elements.push(element);
    };
    View.prototype.draw = function () {
        this.background();
        this.elements.map(function (e) { return e.draw(); });
    };
    View.prototype.setFont = function () {
        this.context.font = "bold " + this.fontSize + "px Arial";
    };
    return View;
}());
//# sourceMappingURL=View.js.map