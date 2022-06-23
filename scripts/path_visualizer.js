class PathVisualizer {
    constructor() {
        this.state = State.OFF;
        this.pathPoints = null;
        this.playerPos = null;
        this.lvl = null;
    }

    isActive() {
        return this.state == State.ON;
    }

    activate(path) {
        this.state = State.ON;
        this.pathPoints = path.elements;
        this.playerPos = this.pathPoints[0];
        this.lvl = level.clone();

        document.getElementById("calculate_the_shortest_path").disabled = true;
        document.getElementById("export").disabled = true;
    }

    cancel() {
        if (this.state == State.OFF) return;

        this.state = State.OFF;
        level = this.lvl;

        document.getElementById("calculate_the_shortest_path").disabled = false;
        document.getElementById("export").disabled = false;
    }

    display() {
        if (this.state == State.OFF) return;
        image(playerImg, this.playerPos.x * TILE_SIZE + TILE_SIZE / 2, this.playerPos.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
    }

    step() {
        if (this.state == State.OFF) return;
        this.pathPoints.shift();

        if (this.pathPoints.length == 0) {
            this.cancel();
            return;
        }

        this.pathPoints[0] == Path.PULL_LEVER ? level.pullLever(this.playerPos) : this.playerPos = this.pathPoints[0];
    }
}