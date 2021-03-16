class GoalDrivenProperty extends NumericProperty {
    stepValue: number;
    goalValue: number;

    constructor(value: number = 0, goalValue: number = 0, stepValue: number = 0, name = "Animatable") {
        super(value, name);
        this.goalValue = goalValue;
        this.stepValue = stepValue;
    }

    step(): number {
        this.value += this.stepValue;
        return this.value;
    }
}
