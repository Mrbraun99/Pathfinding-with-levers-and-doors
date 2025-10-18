class CircuitEvaluator {
    constructor(circuit) {
        const levers = circuit.entities.filter(e => e.tile === Tile.LEVER);

        this.levers = Object.fromEntries(levers.map((lever, index) => [lever.pos.x + "," + lever.pos.y, index]));
        this.state = levers.map(lever => lever.state).join("");

        const gates = circuit.entities.filter(entity => [Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(entity.tile));
        const processed = new Set();
        const processed_gates = [];

        while (gates.length > 0) {
            const gate = gates.shift();
            const is_ready = gate.predecessors.filter(entity => [Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(entity.tile)).every(entity => processed.has(entity));

            if (!is_ready) {
                gates.push(gate);
                continue;
            }

            processed.add(gate);
            processed_gates.push(gate);
        }

        this.core = [];
        for (const gate of processed_gates) {
            const predecessors = [];

            for (const predecessor of gate.predecessors) {
                switch (predecessor.tile) {
                    case Tile.LEVER:
                        {
                            predecessors.push(this.levers[predecessor.pos.x + "," + predecessor.pos.y]);
                            break;
                        }
                    case Tile.AND_GATE:
                    case Tile.OR_GATE:
                    case Tile.NOT_GATE:
                        {
                            predecessors.push(processed_gates.indexOf(predecessor) + Object.keys(this.levers).length);
                            break;
                        }
                }
            }

            this.core.push({ "tile": gate.tile, "predecessors": predecessors });
        }

        this.doors = {};
        for (const door of circuit.entities.filter(entity => entity.tile == Tile.DOOR)) {
            const predecessors = [];

            for (const predecessor of door.predecessors) {
                switch (predecessor.tile) {
                    case Tile.LEVER:
                        {
                            predecessors.push(this.levers[predecessor.pos.x + "," + predecessor.pos.y]);
                            break;
                        }
                    case Tile.AND_GATE:
                    case Tile.OR_GATE:
                    case Tile.NOT_GATE:
                        {
                            predecessors.push(processed_gates.indexOf(predecessor) + Object.keys(this.levers).length);
                            break;
                        }
                }
            }

            this.doors[door.pos.x + "," + door.pos.y] = predecessors;
        }
    }

    pull(lever, state) {
        const index = this.levers[lever];
        return state.substring(0, index) + (State.change(state[index])) + state.substring(index + 1);
    }

    evaluate(state) {
        const core = [...state.split(""), ...this.core];

        for (let i = state.length; i < core.length; i++) {
            const inputs = core[i].predecessors.map(index => core[index])

            switch (core[i].tile) {
                case Tile.AND_GATE:
                    {
                        core[i] = inputs.every(state => state == State.ON) ? State.ON : State.OFF;
                        break;
                    }
                case Tile.OR_GATE:
                    {
                        core[i] = inputs.some(state => state == State.ON) ? State.ON : State.OFF;
                        break;
                    }
                case Tile.NOT_GATE:
                    {
                        core[i] = State.change(inputs[0]);
                        break;
                    }
            }
        }

        return Object.fromEntries(Object.entries(this.doors).map(([pos, predecessors]) => [pos, core[predecessors[0]] ?? State.OFF]));
    }
}