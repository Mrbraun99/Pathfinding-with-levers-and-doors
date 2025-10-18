class Level {
    static grid = [...Array(LEVEL_SIZE.y)].map(e => Array(LEVEL_SIZE.x).fill(null));
    static src = { x: 0, y: 0 };
    static dst = { x: 1, y: 0 };
    static circuit = new Circuit();

    static export() {
        saveJSON({ "grid": Level.grid, "circuit": Level.circuit.serialize(), "src": Level.src, "dst": Level.dst }, "level.json");
    }

    static import(data) {
        Level.grid = data.grid;
        Level.src = data.src;
        Level.dst = data.dst;
        Level.circuit.load(data.circuit);
    }

    static display() {
        for (let y = 0; y < LEVEL_SIZE.y; y++) {
            for (let x = 0; x < LEVEL_SIZE.x; x++) {
                if (Level.grid[y][x] == Tile.WALL) {
                    image(images["WALL"], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    continue;
                }

                image(images["GRASS"], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }

        image(images["START_POINT"], Level.src.x * TILE_SIZE, Level.src.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        image(images["FINISH_POINT"], Level.dst.x * TILE_SIZE, Level.dst.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        for (const entity of Level.circuit.entities) {
            switch (entity.tile) {
                case Tile.AND_GATE:
                case Tile.OR_GATE:
                case Tile.NOT_GATE:
                    {
                        push();
                        translate(entity.pos.x * TILE_SIZE + TILE_SIZE / 2, entity.pos.y * TILE_SIZE + TILE_SIZE / 2);
                        rotate(radians(entity.rotation));
                        imageMode(CENTER);
                        image(images[entity.tile], 0, 0, TILE_SIZE, TILE_SIZE);
                        pop();

                        image(text_images[entity.tile], entity.pos.x * TILE_SIZE, entity.pos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                        break;
                    }
                case Tile.LEVER:
                    {
                        image(entity.state == State.ON ? images["LEVER_ON"] : images["LEVER_OFF"], entity.pos.x * TILE_SIZE, entity.pos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                        break;
                    }
                case Tile.DOOR:
                    {
                        image(entity.state == State.ON ? images["DOOR_ON"] : images["DOOR_OFF"], entity.pos.x * TILE_SIZE, entity.pos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                        break;
                    }
            }
        }

        for (const entity of Level.circuit.entities) {
            for (const predecessor of entity.predecessors) {
                strokeWeight(2);
                stroke(State.color(predecessor.state));
                fill(State.color(predecessor.state));

                const src_offset = predecessor.tile == Tile.LEVER ? { x: 0, y: 0 } : WIRE_SRC_OFFSET[predecessor.rotation];
                const dst_offset = entity.tile == Tile.DOOR ? { x: 0, y: 0 } : WIRE_DST_OFFSET[entity.rotation];

                const src = { x: (predecessor.pos.x + 0.5) * TILE_SIZE + src_offset.x, y: (predecessor.pos.y + 0.5) * TILE_SIZE + src_offset.y };
                const dst = { x: (entity.pos.x + 0.5) * TILE_SIZE + dst_offset.x, y: (entity.pos.y + 0.5) * TILE_SIZE + dst_offset.y };

                circle(src.x, src.y, TILE_SIZE / 6);
                circle(dst.x, dst.y, TILE_SIZE / 6);

                line(src.x, src.y, dst.x, dst.y,);
            }
        }
    }

    static createGraph() {
        const tile_graph = {};

        for (let y = 0; y < LEVEL_SIZE.y; y++) {
            for (let x = 0; x < LEVEL_SIZE.x; x++) {
                if (Level.grid[y][x] != Tile.WALL) {
                    tile_graph[x + "," + y] = {};
                }
            }
        }

        for (let y = 0; y < LEVEL_SIZE.y; y++) {
            for (let x = 0; x < LEVEL_SIZE.x; x++) {
                if (Level.grid[y][x] == Tile.WALL) continue;

                if (x + 1 < LEVEL_SIZE.x && Level.grid[y][x + 1] != Tile.WALL) {
                    tile_graph[x + "," + y][(x + 1) + "," + y] = { "distance": 1 };
                }

                if (y + 1 < LEVEL_SIZE.y && Level.grid[y + 1][x] != Tile.WALL) {
                    tile_graph[x + "," + y][x + "," + (y + 1)] = { "distance": 1 };
                }

                if (x - 1 >= 0 && Level.grid[y][x - 1] != Tile.WALL) {
                    tile_graph[x + "," + y][(x - 1) + "," + y] = { "distance": 1 };
                }

                if (y - 1 >= 0 && Level.grid[y - 1][x] != Tile.WALL) {
                    tile_graph[x + "," + y][x + "," + (y - 1)] = { "distance": 1 };
                }
            }
        }

        const checkpoints = [];
        for (const entity of Level.circuit.entities.filter(entity => [Tile.DOOR, Tile.LEVER].includes(entity.tile))) {
            checkpoints.push(entity.pos.x + "," + entity.pos.y);
        }

        const graph = {};
        graph[Level.dst.x + "," + Level.dst.y] = {};
        const doors = new Set(Level.circuit.entities.filter(entity => entity.tile == Tile.DOOR).map(entity => entity.pos.x + "," + entity.pos.y));

        for (const src of [Level.src.x + "," + Level.src.y, ...checkpoints]) {
            const nodes = {};
            for (const pos of Object.keys(tile_graph)) nodes[pos] = {
                "pos": pos,
                "distance": Infinity,
                "visited": false,
                "valid": true,
                "parent": null
            };

            nodes[src].distance = 0;

            const heap = new MinHeap("distance");
            heap.insert(nodes[src]);

            while (!heap.isEmpty()) {
                const node = heap.pop();

                if (!node.valid || (src != node.pos && doors.has(node.pos))) continue;
                node.visited = true;

                for (const neighbour of Object.keys(tile_graph[node.pos]).map(key => nodes[key])) {
                    if (neighbour.visited) continue;

                    if (neighbour.distance > node.distance + tile_graph[node.pos][neighbour.pos].distance) {
                        neighbour.valid = false;
                        nodes[neighbour.pos] = {
                            "pos": neighbour.pos,
                            "distance": node.distance + tile_graph[node.pos][neighbour.pos].distance,
                            "visited": false,
                            "valid": true,
                            "parent": node
                        };

                        heap.insert(nodes[neighbour.pos]);
                    }
                }
            }

            graph[src] = {};
            for (const dst of [Level.dst.x + "," + Level.dst.y, ...checkpoints]) {
                if (src == dst) continue;

                const path = [];
                let current = nodes[dst];

                while (current.parent != null) {
                    path.unshift(current.pos);
                    current = current.parent;
                }

                graph[src][dst] = { "distance": nodes[dst].distance, "path": path };
            }
        }

        return graph;
    }
}