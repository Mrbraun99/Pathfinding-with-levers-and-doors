class Circuit {
    constructor() {
        this.entities = [];
    }

    load(data) {
        this.entities = {};

        for (const [pos, entity] of Object.entries(data.entities)) {
            const [x, y] = pos.split(",").map(value => parseInt(value));
            this.entities[pos] = { "pos": { x: x, y: y }, ...entity, "predecessors": [] };
        }

        for (const wire of data.wires) {
            this.entities[wire.dst].predecessors.push(this.entities[wire.src]);
        }

        this.entities = Object.values(this.entities);
    }

    hasLoop() {
        const gates = this.entities.filter(entity => [Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(entity.tile));

        for (const gate of gates) {
            const visited = new Set();
            const queue = [...(gate.predecessors ?? [])];

            while (queue.length > 0) {
                const entity = queue.shift();

                if (entity == gate) return true;

                if (visited.has(entity)) continue;
                visited.add(entity);

                const predecessors = (entity.predecessors ?? []).filter(entity => [Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(entity.tile));
                queue.push(...predecessors);
            }
        }

        return false;
    }

    evaluate() {
        const gates = this.entities.filter(entity => [Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(entity.tile));
        const processed = new Set();
        const processed_gates = [];

        while (gates.length > 0) {
            const gate = gates.shift();
            const is_ready = gate.predecessors.filter(entity => [Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(entity.tile)).every(entity => processed.has(entity));

            if (!is_ready) {
                gates.push(gate);
                continue;
            }

            const inputs = (gate.predecessors ?? []).map(entity => entity.state);

            switch (gate.tile) {
                case Tile.AND_GATE: {
                    gate.state = inputs.length == 0 ? State.OFF : inputs.every(state => state == State.ON) ? State.ON : State.OFF;
                    break;
                }
                case Tile.OR_GATE: {
                    gate.state = inputs.length == 0 ? State.OFF : inputs.some(state => state == State.ON) ? State.ON : State.OFF;
                    break;
                }
                case Tile.NOT_GATE: {
                    gate.state = inputs.length == 0 ? State.ON : State.change(inputs[0]);
                    break;
                }
            }

            processed.add(gate);
            processed_gates.push(gate);
        }

        for (const door of this.entities.filter(entity => entity.tile == Tile.DOOR)) {
            door.state = door.predecessors.length == 0 ? State.OFF : door.predecessors[0].state;
        }
    }

    prettify() {
        const gates = this.entities.filter(entity => [Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(entity.tile));
        const processed = new Set();
        const processed_gates = [];

        while (gates.length > 0) {
            const gate = gates.shift();
            const is_ready = gate.predecessors.filter(entity => [Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(entity.tile)).every(entity => processed.has(entity));

            if (!is_ready) {
                gates.push(gate);
                continue;
            }

            const connections = {
                "inputs": {
                    "gates": gate.predecessors ?? [],
                    "gate_offset": WIRE_DST_OFFSET,
                    "entity_offset_fn": (entity) => entity.tile == Tile.LEVER ? { x: 0, y: 0 } : WIRE_SRC_OFFSET[entity.rotation],
                    "wires": []
                },
                "outputs": {
                    "gates": this.entities.filter(entity => entity.predecessors.includes(gate)),
                    "gate_offset": WIRE_SRC_OFFSET,
                    "entity_offset_fn": (entity) => entity.tile == Tile.DOOR ? { x: 0, y: 0 } : WIRE_DST_OFFSET[entity.rotation],
                    "wires": []
                },
            }

            const center = { x: (gate.pos.x + 0.5) * TILE_SIZE, y: (gate.pos.y + 0.5) * TILE_SIZE };
            const half_size = TILE_SIZE * 0.8 / 2;

            const corners = [
                { x: center.x - half_size, y: center.y - half_size },
                { x: center.x + half_size, y: center.y - half_size },
                { x: center.x + half_size, y: center.y + half_size },
                { x: center.x - half_size, y: center.y + half_size }
            ]

            const cost_values = {};
            for (const rotation of [0, 90, 180, 270]) {
                connections.inputs.wires = [];
                connections.outputs.wires = [];
                cost_values[rotation] = 0;

                for (const connection of Object.values(connections)) {
                    const p2 = { x: (gate.pos.x + 0.5) * TILE_SIZE + connection.gate_offset[rotation].x, y: (gate.pos.y + 0.5) * TILE_SIZE + connection.gate_offset[rotation].y };

                    for (const entity of connection.gates) {
                        const entity_offset = connection.entity_offset_fn(entity);
                        const p1 = { x: (entity.pos.x + 0.5) * TILE_SIZE + entity_offset.x, y: (entity.pos.y + 0.5) * TILE_SIZE + entity_offset.y };

                        connection.wires.push({ "p1": p1, "p2": p2 });
                    }
                }

                for (const l of [...connections.inputs.wires, ...connections.outputs.wires]) {
                    const intersections = Intersection.rectline(corners, l);

                    if (intersections.length == 2) {
                        cost_values[rotation] += Math.pow(intersections[0].x - intersections[1].x, 2) + Math.pow(intersections[0].y - intersections[1].y, 2);
                    }
                }

                for (const l1 of connections.inputs.wires) {
                    for (const l2 of connections.outputs.wires) {
                        const intersection = Intersection.lineline(l1, l2);

                        if (intersection) {
                            cost_values[rotation] += Math.pow(TILE_SIZE, 4);
                        }
                    }
                }
            }

            let best_rotation = gate.rotation;
            for (const rotation of [0, 90, 180, 270]) {
                if (Math.abs(cost_values[rotation] - cost_values[best_rotation]) > 0.01 && cost_values[rotation] < cost_values[best_rotation]) {
                    best_rotation = rotation;
                }
            }

            gate.rotation = best_rotation;

            processed.add(gate);
            processed_gates.push(gate);
        }
    }

    serialize() {
        const entities = {};
        const wires = [];

        for (const entity of this.entities) {
            entities[entity.pos.x + "," + entity.pos.y] = {
                "tile": entity.tile,
                "state": entity.state,
                "rotation": entity.rotation
            };

            for (const predecessor of entity.predecessors) {
                wires.push({
                    "src": predecessor.pos.x + "," + predecessor.pos.y,
                    "dst": entity.pos.x + "," + entity.pos.y
                });
            }
        }

        return { "entities": entities, "wires": wires };
    }
}