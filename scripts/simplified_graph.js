class SimplifiedGraph {
    static create(movementGraph) {
        const dijkstra = (graph, src) => {
            graph.vertices[str(src.x) + "," + str(src.y)].dist = 0;
            let vertices = Object.values(graph.vertices);

            while (vertices.length != 0) {
                let index = 0;
                let vertex = vertices.reduce((prev, current, idx) => {
                    if (prev.dist < current.dist) return prev;
                    index = idx;
                    return current;
                });

                vertices.splice(index, 1);
                if (vertex.dist == INFINITY_DISTANCE) break;
                if (vertex.dist != 0 && vertex.data.tile == Tile.DOOR) continue;

                for (const edge of graph.getEdges(vertex)) {
                    if (edge.vertex.dist > vertex.dist + edge.length) {
                        edge.vertex.dist = vertex.dist + edge.length;
                        edge.vertex.parent = vertex;
                    }
                }
            }
        }

        let simplifiedGraph = new Graph();
        let paths = {};

        for (const vertex of Object.values(movementGraph.vertices)) if ([Tile.LEVER, Tile.DOOR, Tile.START_POINT, Tile.FINISH_POINT].includes(vertex.data.tile)) simplifiedGraph.addVertex({ x: vertex.pos.x, y: vertex.pos.y }, { "tile": vertex.data.tile });

        for (const src of Object.values(simplifiedGraph.vertices).map(vertex => vertex.pos)) {
            let graph = movementGraph.copy();
            dijkstra(graph, src);

            for (const dst of Object.values(simplifiedGraph.vertices).map(vertex => vertex.pos)) {
                if (src.x == dst.x && src.y == dst.y) continue;

                let vertex = graph.vertices[str(dst.x) + "," + str(dst.y)];
                if (vertex.dist == INFINITY_DISTANCE) continue;

                let path = [];
                while (vertex != null) {
                    path.unshift(vertex.pos);
                    vertex = vertex.parent;
                }

                paths[str(src.x) + "," + str(src.y) + "-" + str(dst.x) + "," + str(dst.y)] = path;
                simplifiedGraph.addEdge(src, dst, path.length - 1);
            }
        }

        return { "graph": simplifiedGraph, "paths": paths };
    }
}