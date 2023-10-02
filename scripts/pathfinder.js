class Pathfinder {
    static search(tiles, circuit) {
        let result = SimplifiedGraph.create(MovementGraph.create(tiles));
        let graph = result.graph;
        let paths = result.paths;

        let src;
        let dst;
        let leverPositions = [];

        for (const vertex of Object.values(graph.vertices)) {
            switch (vertex.data.tile) {
                case Tile.LEVER:
                    {
                        leverPositions.push({ x: vertex.pos.x, y: vertex.pos.y });
                        break;
                    }
                case Tile.START_POINT:
                    {
                        src = { x: vertex.pos.x, y: vertex.pos.y };
                        break;
                    }
                case Tile.FINISH_POINT:
                    {
                        dst = { x: vertex.pos.x, y: vertex.pos.y };
                        break;
                    }
            }
        }

        let vertices = [];
        let visited = {};

        let world = new World(graph.copy(), circuit.copy());
        world.graph.vertices[str(src.x) + "," + str(src.y)].dist = 0;

        vertices.push(...Object.values(world.graph.vertices));

        while (vertices.length != 0) {
            let index = 0;
            let vertex = vertices.reduce((prev, current, idx) => {
                if (prev.dist < current.dist) return prev;
                index = idx;
                return current;
            });

            vertices.splice(index, 1);

            if (vertex.dist == INFINITY_DISTANCE) return null;
            if (vertex.pos.x == dst.x && vertex.pos.y == dst.y) {
                let checkpoints = [];

                while (true) {
                    checkpoints.unshift(vertex.pos);
                    if ((vertex = vertex.parent) == null) break;;
                }

                let steps = [];
                for (let i = 0; i < checkpoints.length - 1; i++) {
                    if (checkpoints[i].x == checkpoints[i + 1].x && checkpoints[i].y == checkpoints[i + 1].y) {
                        steps.push({ "action": Action.PULL_LEVER, "pos": { x: checkpoints[i].x, y: checkpoints[i].y } });
                        continue;
                    }

                    steps.push(...paths[str(checkpoints[i].x) + "," + str(checkpoints[i].y) + "-" + str(checkpoints[i + 1].x) + "," + str(checkpoints[i + 1].y)].slice(1).map(pos => { return { "action": Action.MOVE, "pos": pos } }));
                }

                steps.unshift(checkpoints[0]);
                return steps;
            }

            if (vertex.data.tile == Tile.LEVER) {
                let id = leverPositions.map(pos => (pos.x == vertex.pos.x && pos.y == vertex.pos.y) ? "?" : str(vertex.data.world.circuit.data.elements[str(pos.x) + "," + str(pos.y)].state)).join("") + "[" + str(vertex.pos.x) + "," + str(vertex.pos.y) + "]";

                let state = vertex.data.world.circuit.data.elements[str(vertex.pos.x) + "," + str(vertex.pos.y)].state;
                let worldId = id.replace("?", str(state));
                let nextWorldId = id.replace("?", str(State.flip(state)));

                if (visited[nextWorldId] == null) {
                    let nextWorld = new World(graph.copy(), vertex.data.world.circuit.copy());

                    nextWorld.graph.vertices[str(vertex.pos.x) + "," + str(vertex.pos.y)].parent = vertex;
                    nextWorld.graph.vertices[str(vertex.pos.x) + "," + str(vertex.pos.y)].dist = vertex.dist + 0.0001;

                    nextWorld.circuit.interact(vertex.pos);
                    vertices.push(...Object.values(nextWorld.graph.vertices));

                    visited[worldId] = true;
                    visited[nextWorldId] = true;
                }
            }

            for (const edge of vertex.data.world.graph.getEdges(vertex)) {
                if (edge.vertex.data.tile == Tile.DOOR && edge.vertex.data.world.circuit.data.elements[str(edge.vertex.pos.x) + "," + str(edge.vertex.pos.y)].state == State.OFF) continue;

                if (edge.vertex.dist > vertex.dist + edge.length) {
                    edge.vertex.dist = vertex.dist + edge.length;
                    edge.vertex.parent = vertex;
                }
            }
        }
    }
}