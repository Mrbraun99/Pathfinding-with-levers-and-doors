class State {
    static OFF = "0";
    static ON = "1";

    static change(state) {
        return state == State.ON ? State.OFF : State.ON;
    }

    static color(state) {
        return state == State.ON ? color(255, 0, 0) : color(100, 0, 0);
    }
}