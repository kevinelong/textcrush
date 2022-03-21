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
var TextElement = (function (_super) {
    __extends(TextElement, _super);
    function TextElement(view, text, align) {
        if (align === void 0) { align = "center"; }
        var _this = _super.call(this, view) || this;
        _this.lines = [];
        _this.text = text;
        _this.size = _this.view.fontSize;
        _this.align = align;
        var c = _this.view.context;
        _this.height = c.measureText("W").width + 1;
        _this.x = Math.floor(c.canvas.width / 2);
        _this.splitLines(text);
        view.cursor.y += (_this.height * 1.125) * _this.lines.length;
        return _this;
    }
    TextElement.prototype.splitLines = function (text) {
        var c = this.view.context;
        var overflow = [];
        var words = text.split(" ");
        this.width = c.measureText(text).width;
        var padding = this.view.padding.left + this.view.padding.right;
        var inner = this.view.canvas.width - padding;
        while (this.width > inner && words.length > 1) {
            overflow.push(words.pop());
            text = words.join(" ");
            this.width = c.measureText(text).width;
        }
        this.lines.push(text);
        if (overflow.length > 0) {
            this.splitLines(overflow.reverse().join(" "));
        }
    };
    TextElement.prototype.drawText = function (text, y) {
        var c = this.view.context;
        c.globalAlpha = 1;
        c.lineWidth = this.size / 8 + 2;
        c.fillStyle = "white";
        c.strokeStyle = "black";
        c.lineJoin = "round";
        c.textAlign = this.align;
        c.strokeText(text, this.x, y);
        c.fillText(text, this.x, y);
    };
    TextElement.prototype.draw = function () {
        for (var i = this.lines.length - 1; i >= 0; i--) {
            var o = this.lines.length - i - 1;
            var y = this.y + ((this.height * 1.125) * i);
            this.drawText(this.lines[i], y);
        }
    };
    return TextElement;
}(ViewElement));
//# sourceMappingURL=TextElement.js.map