class LevelEditor {
    constructor() {
        this.size = { x: LEVEL_SIZE.x, y: LEVEL_SIZE.y };

        this.tiles = [...Array(this.size.y)].map(e => Array(this.size.x).fill(Tile.GRASS));
        this.circuit = new Circuit();

        this.srcPoint = { x: 0, y: 0 };
        this.build(this.srcPoint, Tile.START_POINT);

        this.dstPoint = { x: 0, y: 1 };
        this.build(this.dstPoint, Tile.FINISH_POINT);
    }

    build(pos, tile) {
        if (this.tiles[pos.y][pos.x] != Tile.GRASS) return;

        switch (tile) {
            case Tile.WALL:
                {
                    this.tiles[pos.y][pos.x] = Tile.WALL;
                    break;
                }
            case Tile.LEVER:
                {
                    this.tiles[pos.y][pos.x] = Tile.LEVER;
                    this.circuit.build(pos, Tile.LEVER);
                    break;
                }
            case Tile.DOOR:
                {
                    this.tiles[pos.y][pos.x] = Tile.DOOR;
                    this.circuit.build(pos, Tile.DOOR);
                    break;
                }
            case Tile.AND_GATE:
                {
                    this.tiles[pos.y][pos.x] = Tile.AND_GATE;
                    this.circuit.build(pos, Tile.AND_GATE);
                    break;
                }
            case Tile.OR_GATE:
                {
                    this.tiles[pos.y][pos.x] = Tile.OR_GATE;
                    this.circuit.build(pos, Tile.OR_GATE);
                    break;
                }
            case Tile.NOT_GATE:
                {
                    this.tiles[pos.y][pos.x] = Tile.NOT_GATE;
                    this.circuit.build(pos, Tile.NOT_GATE);
                    break;
                }
            case Tile.START_POINT:
                {
                    this.tiles[this.srcPoint.y][this.srcPoint.x] = Tile.GRASS;
                    this.tiles[pos.y][pos.x] = Tile.START_POINT;
                    this.srcPoint = { x: pos.x, y: pos.y };
                    break;
                }
            case Tile.FINISH_POINT:
                {
                    this.tiles[this.dstPoint.y][this.dstPoint.x] = Tile.GRASS;
                    this.tiles[pos.y][pos.x] = Tile.FINISH_POINT;
                    this.dstPoint = { x: pos.x, y: pos.y };
                    break;
                }
        }
    }

    destroy(pos) {
        if ([Tile.START_POINT, Tile.FINISH_POINT].includes(this.tiles[pos.y][pos.x])) return;
        if ([Tile.LEVER, Tile.DOOR, Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(this.tiles[pos.y][pos.x])) this.circuit.destroy(pos);
        this.tiles[pos.y][pos.x] = Tile.GRASS;
    }

    export() {
        saveJSON({ "tiles": this.tiles, "circuit": { "data": this.circuit.data }, "srcPoint": this.srcPoint, "dstPoint": this.dstPoint }, "level.json");
    }

    import(file) {
        this.tiles = file.data["tiles"];
        this.circuit.data = file.data["circuit"]["data"];
        this.srcPoint = file.data["srcPoint"];
        this.dstPoint = file.data["dstPoint"];
    }

    display() {
        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                image(images.GRASS, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

                let img;
                switch (this.tiles[y][x]) {
                    case Tile.GRASS:
                        {
                            img = images.GRASS;
                            break;
                        }
                    case Tile.WALL:
                        {
                            img = images.WALL;
                            break;
                        }
                    case Tile.LEVER:
                        {
                            let state = this.circuit.data.elements[str(x) + "," + str(y)].state;
                            img = (state == State.ON) ? images.LEVER_ON : images.LEVER_OFF;
                            break;
                        }
                    case Tile.DOOR:
                        {
                            let state = this.circuit.data.elements[str(x) + "," + str(y)].state;
                            img = (state == State.ON) ? images.DOOR_ON : images.DOOR_OFF;
                            break;
                        }
                    case Tile.AND_GATE:
                        {
                            img = images.AND_GATE;
                            break;
                        }
                    case Tile.OR_GATE:
                        {
                            img = images.OR_GATE;
                            break;
                        }
                    case Tile.NOT_GATE:
                        {
                            img = images.NOT_GATE;
                            break;
                        }
                    case Tile.START_POINT:
                        {
                            img = images.START_POINT;
                            break;
                        }
                    case Tile.FINISH_POINT:
                        {
                            img = images.FINISH_POINT;
                            break;
                        }
                }

                image(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }

        for (const wire of this.circuit.data.wires) {
            let stateColor = wire.state == State.ON ? color(255, 0, 0) : color(100, 0, 0);

            strokeWeight(3);
            fill(stateColor);
            stroke(stateColor);

            let srcOffset = [Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(this.circuit.data.elements[str(wire.src.x) + "," + str(wire.src.y)].tile) ? TILE_SIZE / 3 : 0;
            let src = { x: wire.src.x * TILE_SIZE + TILE_SIZE / 2 + srcOffset, y: wire.src.y * TILE_SIZE + TILE_SIZE / 2 };

            let dstOffset = [Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(this.circuit.data.elements[str(wire.dst.x) + "," + str(wire.dst.y)].tile) ? -TILE_SIZE / 3 : 0;
            let dst = { x: wire.dst.x * TILE_SIZE + TILE_SIZE / 2 + dstOffset, y: wire.dst.y * TILE_SIZE + TILE_SIZE / 2 };

            circle(src.x, src.y, TILE_SIZE / 6);
            circle(dst.x, dst.y, TILE_SIZE / 6);
            line(src.x, src.y, dst.x, dst.y);
        }
    }

    static getMouseGridPosition() {
        if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) return { x: int(mouseX / TILE_SIZE), y: int(mouseY / TILE_SIZE) };
        return null;
    }
}