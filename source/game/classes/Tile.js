var Tile = (function () {
    function Tile(position, board, display) {
        this.position = position;
        this.board = board;
        this.display = display;
        this.cx = (this.position.x * this.display.step) + this.display.horizontalOffset;
        this.cy = (this.position.y * this.display.step) + this.display.verticalOffset;
    }
    Tile.prototype.clear = function () {
        var c = this.display.context;
        var step = this.display.step;
        var padding = this.display.padding;
        c.beginPath();
        c.arc(this.cx + (step - padding) / 2, this.cy + (step - padding) / 2, step / 2 - padding, 0, 2 * Math.PI, false);
        c.fillStyle = "rgba(128,128,128,0.25)";
        c.strokeStyle = "rgba(128,128,128,0.25)";
        c.fill();
    };
    Tile.prototype.circle = function () {
        var c = this.display.context;
        var step = this.display.step;
        var padding = this.display.padding;
        c.beginPath();
        c.arc(this.cx + (step - padding) / 2, this.cy + (step - padding) / 2, step / 2 - padding, 0, 2 * Math.PI, false);
        c.fillStyle = this.position.color;
        c.strokeStyle = this.position.color;
        c.fill();
    };
    Tile.prototype.highlight = function () {
        var c = this.display.context;
        var step = this.display.step;
        var padding = this.display.padding;
        var cx = this.cx;
        var cy = this.cy + Math.ceil(step * 0.1);
        c.beginPath();
        c.ellipse(cx + (step - padding) / 2, cy + (((step - padding) / 2) * 0.1), (step / 2 - padding) * 0.5, (step / 2 - padding) * 0.2, 0, 0, 2 * Math.PI, false);
        c.fillStyle = 'rgba(255,255,255,0.3)';
        c.fill();
    };
    Tile.prototype.shadow = function () {
        var c = this.display.context;
        var step = this.display.step;
        var padding = this.display.padding;
        var cx = this.cx;
        var cy = this.cy + ((step - padding) * 0.75);
        c.beginPath();
        c.ellipse(cx + (step - padding) / 2, cy + (((step - padding) / 2) * 0.1), (step / 2 - padding) * 0.5, (step / 2 - padding) * 0.2, 0, 0, 2 * Math.PI, false);
        c.fillStyle = 'rgba(0,0,0,0.3)';
        c.fill();
    };
    Tile.prototype.text = function () {
        var step = this.display.step;
        var padding = this.display.padding;
        var cx = this.cx;
        var cy = this.cy;
        var c = this.display.context;
        var s = this.position.character;
        c.fillStyle = "rgba(255,255,255)";
        c.strokeStyle = "rgba(0,0,0)";
        c.lineWidth = 4.5;
        c.font = "bolder " + ((step - padding) * 0.75) + "px Arial";
        c.globalAlpha = 0.8;
        var mt = c.measureText(s);
        c.strokeText(s, Math.floor(cx + ((step - padding) / 2) - (mt.width / 2)), Math.ceil(cy + (step * 0.75)));
        c.fillText(s, Math.floor(cx + ((step - padding) / 2) - (mt.width / 2)), Math.ceil(cy + (step * 0.75)));
        c.globalAlpha = 1;
    };
    Tile.prototype.draw = function () {
        var c = this.display.context;
        if (-1 === this.position.value) {
            this.clear();
        }
        else {
            this.circle();
            this.highlight();
            this.shadow();
            this.text();
        }
    };
    return Tile;
}());
//# sourceMappingURL=Tile.js.map