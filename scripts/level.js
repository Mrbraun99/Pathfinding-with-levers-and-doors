class Level {
    constructor(size) {
        this.size = size;
        this.grid = JSlib.create2DArray(this.size, null);

        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                this.grid[y][x] = { layer0: Tile.GRASS, layer1: null };
            }
        }

        this.wires = [];
        this.startPoint = createVector(0, 0);
        this.endPoint = createVector(0, 1);
    }

    getTile(pos) {
        return this.grid[pos.y][pos.x];
    }

    build(pos, object) {
        if (this.startPoint.equals(pos) || this.endPoint.equals(pos)) return;

        switch (object) {
            case Tile.WALL:
                {
                    if ([Tile.DOOR_ON, Tile.DOOR_OFF].includes(this.getTile(pos).layer1)) return;
                    this.getTile(pos).layer0 = Tile.WALL;
                    break;
                }
            case Tile.LEVER_OFF:
                {
                    if (this.getTile(pos).layer1 != null) return;
                    this.getTile(pos).layer1 = Tile.LEVER_OFF;
                    break;
                }

            case Tile.DOOR_OFF:
                {
                    if (this.getTile(pos).layer0 == Tile.WALL) return;
                    if (this.getTile(pos).layer1 != null) return;
                    this.getTile(pos).layer1 = Tile.DOOR_OFF;
                    break;
                }
            case Tile.AND_GATE:
                {
                    if (this.getTile(pos).layer1 != null) return;
                    this.getTile(pos).layer1 = Tile.AND_GATE;
                    break;
                }
            case Tile.OR_GATE:
                {
                    if (this.getTile(pos).layer1 != null) return;
                    this.getTile(pos).layer1 = Tile.OR_GATE;
                    break;
                }
            case Tile.NOT_GATE:
                {
                    if (this.getTile(pos).layer1 != null) return;
                    this.getTile(pos).layer1 = Tile.NOT_GATE;
                    break;
                }
            case Tile.START_POINT:
                {
                    if (this.getTile(pos).layer0 != Tile.GRASS) return;
                    if (this.getTile(pos).layer1 != null) return
                    this.startPoint = pos;
                    break;
                }
            case Tile.END_POINT:
                {
                    if (this.getTile(pos).layer0 != Tile.GRASS) return;
                    if (this.getTile(pos).layer1 != null) return
                    this.endPoint = pos;
                    break;
                }
        }
    }

    demolishLayer0(pos) {
        this.getTile(pos).layer0 = Tile.GRASS;
    }

    demolishLayer1(pos) {
        if (this.getTile(pos).layer1 == null) return;

        let outputWires = this.wires.filter(w => w.from.equals(pos));
        let destPositions = [];
        for (const wire of outputWires) destPositions.push(wire.dest);

        this.wires = this.wires.filter(w => !w.from.equals(pos) && !w.dest.equals(pos));
        this.getTile(pos).layer1 = null;
        for (const pos of destPositions) this.updateWireNetwork(pos);
    }

    pullLever(pos) {
        switch (this.getTile(pos).layer1) {
            case Tile.LEVER_ON:
                {
                    this.getTile(pos).layer1 = Tile.LEVER_OFF;
                    break;
                }
            case Tile.LEVER_OFF:
                {
                    this.getTile(pos).layer1 = Tile.LEVER_ON;
                    break;
                }
        }

        this.updateWireNetwork(pos);
    }

    addWire(wire) {
        //Remove Wire
        if (this.wires.find(w => w.equals(wire)) != null) {
            let sameWireIndex = this.wires.findIndex(w => w.equals(wire));
            this.wires.splice(sameWireIndex, 1);
            this.updateWireNetwork(wire.dest);
            return;
        }

        //Check that destination cannot be LEVER and source cannot be DOOR
        if ([Tile.DOOR_ON, Tile.DOOR_OFF].includes(this.getTile(wire.from).layer1)) return;
        if ([Tile.LEVER_ON, Tile.LEVER_OFF].includes(this.getTile(wire.dest).layer1)) return;

        //DOOR and NOT_GATE can only have 1 input wire        
        if ([Tile.DOOR_OFF, Tile.DOOR_ON, Tile.NOT_GATE].includes(this.getTile(wire.dest).layer1) && this.wires.find(w => w.dest.equals(wire.dest)) != null) return;

        this.wires.push(wire);

        try {
            this.updateWireNetwork(wire.from);
        } catch (e) {
            this.addWire(wire);
        }
    }

    updateWireNetwork(pos) {
        if ([Tile.DOOR_OFF, Tile.DOOR_ON].includes(this.getTile(pos).layer1)) {
            if (this.wires.find(w => w.dest.equals(pos)) == null) {
                this.getTile(pos).layer1 = Tile.DOOR_OFF;
                return;
            }

            let inputState = this.wires.find(w => w.dest.equals(pos)).state;
            switch (inputState) {
                case State.ON:
                    {
                        this.getTile(pos).layer1 = Tile.DOOR_ON;
                        break;
                    }
                case State.OFF:
                    {
                        this.getTile(pos).layer1 = Tile.DOOR_OFF;
                        break;
                    }
            }

            return;
        }

        let inputWires = this.wires.filter(w => w.dest.equals(pos));

        let outputState;
        switch (this.getTile(pos).layer1) {
            case Tile.LEVER_ON:
                {
                    outputState = State.ON;
                    break;
                }
            case Tile.LEVER_OFF:
                {
                    outputState = State.OFF;
                    break;
                }
            default:
                {
                    outputState = this.getOutputSignal(this.getTile(pos).layer1, inputWires);
                    break;
                }
        }

        let outputWires = this.wires.filter(w => w.from.equals(pos));

        for (const wire of outputWires) wire.state = outputState;
        for (const wire of outputWires) this.updateWireNetwork(wire.dest);
    }

    getOutputSignal(tile, inputWires) {
        switch (tile) {
            case Tile.AND_GATE:
                {
                    if (inputWires.length == 0) return State.OFF;
                    for (const wire of inputWires) {
                        if (wire.state == State.OFF) return State.OFF;
                    }

                    return State.ON;
                    break;
                }
            case Tile.OR_GATE:
                {
                    if (inputWires.length == 0) return State.OFF;
                    for (const wire of inputWires) {
                        if (wire.state == State.ON) return State.ON;
                    }

                    return State.OFF;
                    break;
                }
            case Tile.NOT_GATE:
                {
                    if (inputWires.length == 0) return State.ON;
                    return State.change(inputWires[0].state);
                    break;

                }
        }
    }

    display() {
        imageMode(CENTER);
        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                image(images[this.getTile(createVector(x, y)).layer0], x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
                if (this.getTile(createVector(x, y)).layer1 != null) image(images[this.getTile(createVector(x, y)).layer1], x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
            }
        }

        //Start/End point       
        let pos;
        pos = this.startPoint;
        image(images[Tile.START_POINT], pos.x * TILE_SIZE + TILE_SIZE / 2, pos.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);

        pos = this.endPoint;
        image(images[Tile.END_POINT], pos.x * TILE_SIZE + TILE_SIZE / 2, pos.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);

        //Wires
        for (const wire of this.wires) {
            let wireColor = wire.state == State.ON ? color(255, 0, 0) : color(100, 0, 0);

            strokeWeight(3);
            fill(wireColor);
            stroke(wireColor);

            let pos0 = createVector(wire.from.x * TILE_SIZE + TILE_SIZE / 2 + wire.fromOffset, wire.from.y * TILE_SIZE + TILE_SIZE / 2);
            let pos1 = createVector(wire.dest.x * TILE_SIZE + TILE_SIZE / 2 + wire.destOffset, wire.dest.y * TILE_SIZE + TILE_SIZE / 2);

            circle(pos0.x, pos0.y, TILE_SIZE / 6);
            circle(pos1.x, pos1.y, TILE_SIZE / 6);
            line(pos0.x, pos0.y, pos1.x, pos1.y);
        }
    }

    clone() {
        let lvlClone = new Level(createVector(this.size.x, this.size.y));

        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                lvlClone.getTile(createVector(x, y)).layer0 = this.getTile(createVector(x, y)).layer0;
                lvlClone.getTile(createVector(x, y)).layer1 = this.getTile(createVector(x, y)).layer1;
            }
        }

        for (const wire of this.wires) lvlClone.wires.push(wire.clone());

        lvlClone.startPoint = createVector(this.startPoint.x, this.startPoint.y);
        lvlClone.endPoint = createVector(this.endPoint.x, this.endPoint.y);

        return lvlClone;
    }
}