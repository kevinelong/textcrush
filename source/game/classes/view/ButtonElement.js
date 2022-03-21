var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ButtonElement = (function (_super) {
    __extends(ButtonElement, _super);
    function ButtonElement(view, text, background, align) {
        if (align === void 0) { align = "center"; }
        var _this = _super.call(this, view) || this;
        _this.text = text;
        _this.background = background;
        _this.size = _this.view.fontSize;
        _this.align = align;
        var c = _this.view.context;
        _this.height = Math.ceil(c.measureText("W").width * 1.5);
        _this.width = c.measureText(text).width;
        _this.x = Math.floor(c.canvas.width / 2);
        view.cursor.y += (_this.height * 1.75);
        return _this;
    }
    ButtonElement.prototype.roundedRect = function (x, y, width, height, radius) {
        var c = this.view.context;
        c.moveTo(x, y + radius);
        c.lineTo(x, y + height - radius);
        c.arcTo(x, y + height, x + radius, y + height, radius);
        c.lineTo(x + width - radius, y + height);
        c.arcTo(x + width, y + height, x + width, y + height - radius, radius);
        c.lineTo(x + width, y + radius);
        c.arcTo(x + width, y, x + width - radius, y, radius);
        c.lineTo(x + radius, y);
        c.arcTo(x, y, x, y + radius, radius);
    };
    ButtonElement.prototype.buttonBackground = function () {
        var padding = this.view.padding.left + this.view.padding.right;
        var width = this.view.canvas.width - padding;
        var height = this.height;
        var radius = Math.ceil(height / 2);
        var c = this.view.context;
        var x = this.view.padding.left;
        var y = this.y - Math.ceil(this.height / 2);
        c.strokeStyle = "black";
        c.fillStyle = this.background;
        var lineWidth = this.size / 24;
        var outer = 6;
        var step = 2;
        for (var lw = outer; lw >= 0; lw -= step) {
            c.lineWidth = lineWidth + lw;
            c.beginPath();
            if ((lw % outer) != 0) {
                c.strokeStyle = "white";
            }
            else {
                c.strokeStyle = "black";
            }
            this.roundedRect(x, y, width, height, radius);
            c.stroke();
            c.fill();
        }
    };
    ButtonElement.prototype.draw = function () {
        this.buttonBackground();
        var c = this.view.context;
        c.globalAlpha = 1;
        c.lineWidth = this.size / 8 + 2;
        c.fillStyle = "white";
        c.strokeStyle = "black";
        c.lineJoin = "round";
        c.textAlign = this.align;
        var y = this.y + Math.ceil(this.height * 0.2);
        c.strokeText(this.text, this.x, y);
        c.fillText(this.text, this.x, y);
    };
    return ButtonElement;
}(ViewElement));
//# sourceMappingURL=ButtonElement.js.map