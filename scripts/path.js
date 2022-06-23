class Path {
    static PULL_LEVER = 0;

    constructor() {
        this.elements = [];
    }

    extend(connection) {
        if (this.elements.length != 0 && this.elements[0] != Path.PULL_LEVER) this.elements.shift();

        if (connection == null) {
            this.elements.unshift(Path.PULL_LEVER);
            return;
        }

        this.elements.unshift(...connection.pathPoints);
    }
}