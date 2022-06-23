class WireConnector {
    connect(pos) {
        if (level.getTile(pos).layer1 == null) {
            this.wire = null;
            return;
        }

        if (this.wire == null) {
            this.wire = new Wire(pos, null);
            this.wire.setFromOffset(![Tile.LEVER_ON, Tile.LEVER_OFF, Tile.DOOR_ON, Tile.DOOR_OFF].includes(level.getTile(pos).layer1));
            return;
        }

        this.wire.dest = pos;
        this.wire.setDestOffset(![Tile.LEVER_ON, Tile.LEVER_OFF, Tile.DOOR_ON, Tile.DOOR_OFF].includes(level.getTile(pos).layer1));

        let wire = this.wire;
        this.wire = null;
        return wire;
    }

    display() {
        if (this.wire == null) return;

        strokeWeight(3);
        fill(100, 0, 0);
        stroke(100, 0, 0);

        circle(this.wire.from.x * TILE_SIZE + TILE_SIZE / 2 + this.wire.fromOffset, this.wire.from.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 6);
        line(this.wire.from.x * TILE_SIZE + TILE_SIZE / 2 + this.wire.fromOffset, this.wire.from.y * TILE_SIZE + TILE_SIZE / 2, mouseX, mouseY);
    }
}