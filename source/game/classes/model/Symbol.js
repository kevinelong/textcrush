var Symbol = (function () {
    function Symbol(value, character, color) {
        if (value === void 0) { value = -1; }
        if (character === void 0) { character = ' '; }
        if (color === void 0) { color = 'white'; }
        this.value = value;
        this.character = character;
        this.color = color;
    }
    return Symbol;
}());
//# sourceMappingURL=Symbol.js.map