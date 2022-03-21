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
var NumericProperty = (function (_super) {
    __extends(NumericProperty, _super);
    function NumericProperty(value, name) {
        if (value === void 0) { value = 0; }
        if (name === void 0) { name = "NumericProperty"; }
        return _super.call(this, value, name) || this;
    }
    return NumericProperty;
}(Property));
//# sourceMappingURL=Number.js.map