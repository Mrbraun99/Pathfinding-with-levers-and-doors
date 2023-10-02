class Circuit {
    constructor(data = null) {
        this.data = data ?? { "elements": {}, "wires": [] };
    }

    build(pos, tile) {
        switch (tile) {
            case Tile.LEVER:
                {
                    this.data.elements[str(pos.x) + "," + str(pos.y)] = { "tile": Tile.LEVER, "state": State.OFF };
                    break;
                }
            case Tile.DOOR:
                {
                    this.data.elements[str(pos.x) + "," + str(pos.y)] = { "tile": Tile.DOOR, "state": State.OFF };
                    break;
                }
            case Tile.AND_GATE:
                {
                    this.data.elements[str(pos.x) + "," + str(pos.y)] = { "tile": Tile.AND_GATE };
                    break;
                }
            case Tile.OR_GATE:
                {
                    this.data.elements[str(pos.x) + "," + str(pos.y)] = { "tile": Tile.OR_GATE };
                    break;
                }
            case Tile.NOT_GATE:
                {
                    this.data.elements[str(pos.x) + "," + str(pos.y)] = { "tile": Tile.NOT_GATE };
                    break;
                }
        }
    }

    destroy(pos) {
        delete this.data.elements[str(pos.x) + "," + str(pos.y)];

        let outputWires = this.data.wires.filter(wire => wire.src.x == pos.x && wire.src.y == pos.y);
        this.data.wires = this.data.wires.filter(wire => !(wire.src.x == pos.x && wire.src.y == pos.y) && !(wire.dst.x == pos.x && wire.dst.y == pos.y));
        for (const wire of outputWires) this._update(wire.dst);
    }

    interact(pos) {
        let element;
        if ((element = this.data.elements[str(pos.x) + "," + str(pos.y)]) != null) {
            if (element.tile == Tile.LEVER) {
                element.state = State.flip(element.state);
                this._update(pos);
            }
        }
    }

    connect(wire) {
        const hasLoop = (src, dst) => {
            if (src.x == dst.x && src.y == dst.y) return true;

            for (const wire of this.data.wires.filter(w => w.src.x == src.x && w.src.y == src.y)) if (hasLoop(wire.dst, dst)) return true;
            return false;
        }

        let index;
        if ((index = this.data.wires.findIndex(w => w.src.x == wire.src.x && w.src.y == wire.src.y && w.dst.x == wire.dst.x && w.dst.y == wire.dst.y)) != -1) {
            this.data.wires.splice(index, 1);
            this._update(wire.dst);
            return;
        }

        if ([Tile.DOOR, Tile.NOT_GATE].includes(this.data.elements[str(wire.dst.x) + "," + str(wire.dst.y)].tile) && this.data.wires.find(w => w.dst.x == wire.dst.x && w.dst.y == wire.dst.y) != null) return;
        if (hasLoop(wire.dst, wire.src)) return;

        this.data.wires.push(wire);
        this._update(wire.src);
    }

    _update(pos) {
        let outputState;
        let element = this.data.elements[str(pos.x) + "," + str(pos.y)];

        switch (element.tile) {
            case Tile.LEVER:
                {
                    outputState = element.state;
                    break;
                }
            case Tile.DOOR:
                {
                    let inputWire = this.data.wires.find(wire => wire.dst.x == pos.x && wire.dst.y == pos.y);
                    element.state = (inputWire != null) ? inputWire.state : State.OFF;
                    return;
                }
            case Tile.AND_GATE:
                {
                    let inputWires = this.data.wires.filter(wire => wire.dst.x == pos.x && wire.dst.y == pos.y);
                    outputState = (inputWires.length != 0 && inputWires.every(wire => wire.state == State.ON)) ? State.ON : State.OFF;
                    break;
                }
            case Tile.OR_GATE:
                {
                    let inputWires = this.data.wires.filter(wire => wire.dst.x == pos.x && wire.dst.y == pos.y);
                    outputState = (inputWires.some(wire => wire.state == State.ON)) ? State.ON : State.OFF;
                    break;
                }
            case Tile.NOT_GATE:
                {
                    let inputWire = this.data.wires.find(wire => wire.dst.x == pos.x && wire.dst.y == pos.y);
                    outputState = (inputWire != null) ? State.flip(inputWire.state) : State.ON;
                    break;
                }
        }

        let outputWires = this.data.wires.filter(wire => wire.src.x == pos.x && wire.src.y == pos.y);
        for (const wire of outputWires) wire.state = outputState;
        for (const wire of outputWires) this._update(wire.dst);
    }

    copy() {
        return new Circuit(JSON.parse(JSON.stringify(this.data)));
    }
}