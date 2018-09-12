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
        c.fillStyle = "rgb(128,128,128)";
        c.strokeStyle = "rgb(128,128,128)";
        c.fill();
        c.globalAlpha = 1;
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
        c.globalAlpha = 0.3;
        c.fillStyle = 'rgb(255,255,255)';
        c.fill();
        c.globalAlpha = 1;
    };
    Tile.prototype.shadow = function () {
        var c = this.display.context;
        var step = this.display.step;
        var padding = this.display.padding;
        var cx = this.cx;
        var cy = this.cy + ((step - padding) * 0.75);
        c.beginPath();
        c.ellipse(cx + (step - padding) / 2, cy + (((step - padding) / 2) * 0.1), (step / 2 - padding) * 0.5, (step / 2 - padding) * 0.2, 0, 0, 2 * Math.PI, false);
        c.globalAlpha = 0.3;
        c.fillStyle = 'rgb(0,0,0)';
        c.fill();
        c.globalAlpha = 1;
    };
    Tile.prototype.text = function () {
        var step = this.display.step;
        var padding = this.display.padding;
        var cx = this.cx;
        var cy = this.cy;
        var c = this.display.context;
        var s = this.position.character;
        c.fillStyle = "rgb(255,255,255)";
        c.strokeStyle = "rgb(0,0,0)";
        c.lineWidth = 4.5;
        c.font = "bolder " + ((step - padding) * 0.75) + "px Arial";
        c.globalAlpha = 0.8;
        c.textAlign = "center";
        var x = Math.floor(cx + ((step - padding / 2) / 2));
        var y = Math.ceil(cy + (step * 0.75));
        c.strokeText(s, x, y);
        c.fillText(s, x, y);
        c.globalAlpha = 1;
    };
    Tile.prototype.draw = function () {
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