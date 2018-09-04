var DisplayConsole = (function () {
    function DisplayConsole() {
    }
    DisplayConsole.prototype.draw = function (b) {
    };
    DisplayConsole.prototype.toString = function (b) {
        var output = [];
        for (var y = 0; y < b.size; y++) {
            var row = [];
            for (var x = 0; x < b.size; x++) {
                var p = b.getPosition(x, y);
                var c = p.character;
                row.push(c);
            }
            output.push(row.join(' '));
        }
        return output.join('\n') + '\n';
    };
    return DisplayConsole;
}());
//# sourceMappingURL=DisplayConsole.js.map