class Pathfinder {
    static search() {
        const src = Level.src.x + "," + Level.src.y;
        const dst = Level.dst.x + "," + Level.dst.y;

        const doors = new Set(Level.circuit.entities.filter(entity => entity.tile == Tile.DOOR).map(entity => entity.pos.x + "," + entity.pos.y));
        const levers = new Set(Level.circuit.entities.filter(entity => entity.tile == Tile.LEVER).map(entity => entity.pos.x + "," + entity.pos.y));

        const graph = Level.createGraph();
        const evaluator = new CircuitEvaluator(Level.circuit);
        const world = new World(graph, null, evaluator, evaluator.state);
        world.nodes[src].distance = 0;

        const visited = new Set();
        visited.add(src + "|" + evaluator.state);

        const heap = new MinHeap("distance");
        heap.insert(world.nodes[src]);

        while (!heap.isEmpty()) {
            const node = heap.pop();

            if (node.pos == dst) {
                const path = [];
                let current = node;

                while (current.parent != null) {
                    path.unshift(...(current.parent.pos == current.pos ? ["PULL_LEVER", current.pos] : graph[current.parent.pos][current.pos].path));
                    current = current.parent;
                }

                return [src, ...path];
            }

            if (!node.valid) continue;
            node.visited = true;

            if (levers.has(node.pos)) {
                visited.add(node.pos + "|" + node.world.state);

                const next_state = evaluator.pull(node.pos, node.world.state);

                if (!visited.has(node.pos + "|" + next_state)) {
                    visited.add(node.pos + "|" + next_state);

                    const next_word = new World(graph, node, evaluator, next_state);
                    heap.insert(next_word.nodes[node.pos]);
                }
            }

            for (const neighbour of Object.keys(graph[node.pos]).map(key => node.world.nodes[key])) {
                if (neighbour.visited) continue;
                if (doors.has(neighbour.pos) && neighbour.world.doors[neighbour.pos] == State.OFF) continue;

                if (neighbour.distance > node.distance + graph[node.pos][neighbour.pos].distance) {
                    neighbour.valid = false;
                    node.world.nodes[neighbour.pos] = {
                        "pos": neighbour.pos,
                        "distance": node.distance + graph[node.pos][neighbour.pos].distance,
                        "visited": false,
                        "valid": true,
                        "parent": node,
                        "world": neighbour.world
                    };

                    heap.insert(node.world.nodes[neighbour.pos]);
                }
            }
        }

        return null;
    }
}