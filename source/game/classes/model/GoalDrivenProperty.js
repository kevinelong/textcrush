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
var GoalDrivenProperty = (function (_super) {
    __extends(GoalDrivenProperty, _super);
    function GoalDrivenProperty(value, goalValue, stepValue, name) {
        if (value === void 0) { value = 0; }
        if (goalValue === void 0) { goalValue = 0; }
        if (stepValue === void 0) { stepValue = 0; }
        if (name === void 0) { name = "Animatable"; }
        var _this = _super.call(this, value, name) || this;
        _this.goalValue = goalValue;
        _this.stepValue = stepValue;
        return _this;
    }
    GoalDrivenProperty.prototype.step = function () {
        this.value += this.stepValue;
        return this.value;
    };
    return GoalDrivenProperty;
}(NumericProperty));
//# sourceMappingURL=GoalDrivenProperty.js.map