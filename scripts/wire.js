class Wire {
    constructor(from, dest) {
        this.from = from;
        this.dest = dest;

        this.fromOffset = 0;
        this.destOffset = 0;

        this.state = State.OFF;
    }

    setFromOffset(value) {
        this.fromOffset = value ? TILE_SIZE / 3 : 0;
    }

    setDestOffset(value) {
        this.destOffset = value ? -TILE_SIZE / 3 : 0;
    }

    equals(other) {
        return this.from.equals(other.from) && this.dest.equals(other.dest);
    }

    clone() {
        let wireClone = new Wire(createVector(this.from.x, this.from.y), createVector(this.dest.x, this.dest.y));

        wireClone.fromOffset = this.fromOffset;
        wireClone.destOffset = this.destOffset;
        wireClone.state = this.state;

        return wireClone;
    }

    toJSON() {
        return { fromX: this.from.x, fromY: this.from.y, destX: this.dest.x, destY: this.dest.y, fromOffset: this.fromOffset, destOffset: this.destOffset, state: this.state };
    }
}