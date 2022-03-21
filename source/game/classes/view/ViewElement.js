var ViewElement = (function () {
    function ViewElement(view) {
        this.width = 0;
        this.height = 0;
        this.x = 0;
        this.y = 0;
        this.view = view;
        this.x = view.cursor.x;
        this.y = view.cursor.y;
    }
    ViewElement.prototype.draw = function () {
    };
    return ViewElement;
}());
//# sourceMappingURL=ViewElement.js.map