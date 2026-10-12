var Tile = (function () {
    function Tile(position, board, display, row, hidden, column) {
        if (row === void 0) { row = null; }
        if (hidden === void 0) { hidden = false; }
        if (column === void 0) { column = null; }
        this.scale = 1;
        this.alpha = 1;
        this.pressed = false;
        this.position = position;
        this.board = board;
        this.display = display;
        this.hidden = hidden;
        var step = this.display.step;
        var r = (row === null) ? this.position.y : row;
        var cx = (column === null) ? this.position.x : column;
        this.cx = (cx * step) + this.display.horizontalOffset;
        this.cy = (r * step) + this.display.verticalOffset;
    }
    Tile.prototype.circle = function () {
        var c = this.display.context;
        var step = this.display.step;
        var padding = this.display.padding;
        var radius = (step / 2 - padding) * this.scale * (this.pressed ? 0.92 : 1);
        var centreX = this.cx + (step - padding) / 2;
        var centreY = this.cy + (step - padding) / 2;
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(centreX, centreY, radius, 0, 2 * Math.PI, false);
        c.fillStyle = this.position.color;
        c.strokeStyle = this.position.color;
        c.fill();
        if (this.pressed) {
            c.beginPath();
            c.arc(centreX, centreY, radius, 0, 2 * Math.PI, false);
            c.lineWidth = padding * 2;
            c.strokeStyle = "rgba(255,255,255,0.45)";
            c.stroke();
        }
    };
    Tile.prototype.highlight = function () {
        var c = this.display.context;
        var step = this.display.step;
        var padding = this.display.padding;
        var cx = this.cx;
        var cy = this.cy + Math.ceil(step * 0.1);
        c.beginPath();
        c.ellipse(cx + (step - padding) / 2, cy + (((step - padding) / 2) * 0.1), (step / 2 - padding) * 0.5 * this.scale, (step / 2 - padding) * 0.2 * this.scale, 0, 0, 2 * Math.PI, false);
        c.globalAlpha = (this.pressed ? 0.5 : 0.3) * this.alpha;
        c.fillStyle = 'rgb(255,255,255)';
        c.fill();
        c.globalAlpha = this.alpha;
    };
    Tile.prototype.shadow = function () {
        var c = this.display.context;
        var step = this.display.step;
        var padding = this.display.padding;
        var cx = this.cx;
        var cy = this.cy + ((step - padding) * 0.75);
        c.beginPath();
        c.ellipse(cx + (step - padding) / 2, cy + (((step - padding) / 2) * 0.1), (step / 2 - padding) * 0.5 * this.scale, (step / 2 - padding) * 0.2 * this.scale, 0, 0, 2 * Math.PI, false);
        c.globalAlpha = 0.3 * this.alpha;
        c.fillStyle = 'rgb(0,0,0)';
        c.fill();
        c.globalAlpha = this.alpha;
    };
    Tile.prototype.text = function () {
        var step = this.display.step;
        var padding = this.display.padding;
        var cx = this.cx;
        var cy = this.cy;
        var c = this.display.context;
        var s = this.position.character;
        c.fillStyle = "rgb(255,244,230)";
        c.strokeStyle = "rgb(0,0,0)";
        c.lineWidth = 2 * this.scale;
        c.font = "bolder " + ((step - padding) * 0.75 * this.scale) + "px Arial";
        c.globalAlpha = this.alpha;
        c.textAlign = "center";
        var x = Math.floor(cx + ((step - padding / 2) / 2));
        var y = Math.ceil(cy + (step / 2) + (step * 0.25) * this.scale);
        c.strokeText(s, x, y);
        c.fillText(s, x, y);
        c.globalAlpha = this.alpha;
    };
    Tile.prototype.draw = function () {
        if (this.hidden || -1 === this.position.value) {
            return;
        }
        this.circle();
        this.highlight();
        this.shadow();
        this.text();
    };
    return Tile;
}());
//# sourceMappingURL=Tile.js.map