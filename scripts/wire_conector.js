const WireConnectorState = Object.freeze({ ZERO_CONNECTION: 0, ONE_CONNECTION: 1 });

class WireConnector {
    constructor() {
        this.state = WireConnectorState.ZERO_CONNECTION;
        this.connectionSrc = null;
    }

    connect(pos) {
        if (editor.circuit.data.elements[str(pos.x) + "," + str(pos.y)] == null) {
            this.state = WireConnectorState.ZERO_CONNECTION;
            return;
        }

        switch (this.state) {
            case WireConnectorState.ZERO_CONNECTION:
                {
                    if (editor.circuit.data.elements[str(pos.x) + "," + str(pos.y)].tile == Tile.DOOR) return null;

                    this.connectionSrc = pos;
                    this.state = WireConnectorState.ONE_CONNECTION;
                    return null;
                }
            case WireConnectorState.ONE_CONNECTION:
                {
                    if (editor.circuit.data.elements[str(pos.x) + "," + str(pos.y)].tile == Tile.LEVER) return null;

                    this.state = WireConnectorState.ZERO_CONNECTION;
                    return { "src": this.connectionSrc, "dst": pos };
                }
        }
    }

    display() {
        switch (this.state) {
            case WireConnectorState.ZERO_CONNECTION:
                {
                    break;
                }
            case WireConnectorState.ONE_CONNECTION:
                {
                    strokeWeight(3);
                    fill(100, 0, 0);
                    stroke(100, 0, 0);

                    let offset = [Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(editor.circuit.data.elements[str(this.connectionSrc.x) + "," + str(this.connectionSrc.y)].tile) ? TILE_SIZE / 3 : 0;

                    circle(this.connectionSrc.x * TILE_SIZE + TILE_SIZE / 2 + offset, this.connectionSrc.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 6);
                    line(this.connectionSrc.x * TILE_SIZE + TILE_SIZE / 2 + offset, this.connectionSrc.y * TILE_SIZE + TILE_SIZE / 2, mouseX, mouseY);
                    break;
                }
        }
    }
}