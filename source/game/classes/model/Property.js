var Property = (function () {
    function Property(value, name) {
        if (name === void 0) { name = "Property"; }
        this.name = name;
        this.value = value;
        this.originalValue = value;
    }
    Property.prototype.isSame = function () {
        return this.value == this.originalValue;
    };
    return Property;
}());
//# sourceMappingURL=Property.js.map