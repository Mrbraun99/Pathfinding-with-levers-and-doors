class Pathfinding {
    static getShortestPath(lvl) {
        let minGraph = Pathfinding.LevelToMinGraph(lvl);

        let vertices = [];
        let visitedWorlds = [];
        let world = new World(lvl, minGraph, null);
        vertices.push(...world.vertices);
        visitedWorlds.push(world.id);

        while (vertices.length != 0) {
            let index = 0;
            let vertex = vertices.reduce((prev, current, idx) => {
                if (prev.dist < current.dist) return prev;
                index = idx;
                return current;
            });

            vertices.splice(index, 1);

            if (vertex.dist == Infinity) return null;
            if (vertex.extraInfo.pos.equals(lvl.endPoint)) {
                let path = new Path();
                let cVertex = vertex;

                while (cVertex.parent != null) {
                    let pathSegment;
                    let connection = minGraph.connections.find(e => e.from.equals(cVertex.parent.extraInfo.pos) && e.dest.equals(cVertex.extraInfo.pos));
                    path.extend(connection);

                    cVertex = cVertex.parent;
                }

                return path;
            }

            switch (vertex.extraInfo.world.lvl.getTile(vertex.extraInfo.pos).layer1) {
                case Tile.DOOR_ON:
                    {
                        vertex.extraInfo.world.clearLeverInteractions();
                        break;
                    }

                case Tile.LEVER_ON:
                case Tile.LEVER_OFF:
                    {
                        if (vertex.extraInfo.world.hasLeverInteraction(vertex.extraInfo.pos)) break;
                        let nextWorld = new World(vertex.extraInfo.world.lvl, minGraph, vertex);
                        if (visitedWorlds.find(id => id == nextWorld.id) != null) break;

                        visitedWorlds.push(nextWorld.id);
                        vertices.push(...nextWorld.vertices);

                        nextWorld.leverInteractions.push(vertex.extraInfo.pos);
                        for (const leverIntPos of vertex.extraInfo.world.leverInteractions) nextWorld.leverInteractions.push(leverIntPos);
                        break;
                    }
            }

            for (const edge of vertex.edges) {
                if (vertex.extraInfo.world.lvl.getTile(edge.vertex.extraInfo.pos).layer1 == Tile.DOOR_OFF) continue;
                if (edge.vertex.dist > vertex.dist + edge.dist) {
                    edge.vertex.dist = vertex.dist + edge.dist;
                    edge.vertex.parent = vertex;
                }
            }
        }
    }

    static LevelToMinGraph(lvl) {
        let objectPosList = [];

        objectPosList.push(lvl.startPoint);
        objectPosList.push(lvl.endPoint);

        for (let y = 0; y < lvl.size.y; y++) {
            for (let x = 0; x < lvl.size.x; x++) {
                if ([Tile.LEVER_ON, Tile.LEVER_OFF, Tile.DOOR_ON, Tile.DOOR_OFF].includes(lvl.getTile(createVector(x, y)).layer1)) {
                    objectPosList.push(createVector(x, y));
                }
            }
        }

        let connections = [];

        for (const objectPos of objectPosList) {
            let vertices1D = [];
            let vertices2D = JSlib.create2DArray(lvl.size, null);

            for (let y = 0; y < lvl.size.y; y++) {
                for (let x = 0; x < lvl.size.x; x++) {
                    let vertex = new Vertex({ pos: createVector(x, y) });
                    vertices1D.push(vertex);
                    vertices2D[y][x] = vertex;
                }
            }

            for (let y = 0; y < lvl.size.y; y++) {
                for (let x = 0; x < lvl.size.x; x++) {
                    if (lvl.getTile(createVector(x, y)).layer0 == Tile.WALL) continue;

                    if (x > 0 && lvl.getTile(createVector(x - 1, y)).layer0 != Tile.WALL) vertices2D[y][x].edges.push(new Edge(vertices2D[y][x - 1], 1));
                    if (y > 0 && lvl.getTile(createVector(x, y - 1)).layer0 != Tile.WALL) vertices2D[y][x].edges.push(new Edge(vertices2D[y - 1][x], 1));

                    if (x < lvl.size.x - 1 && lvl.getTile(createVector(x + 1, y)).layer0 != Tile.WALL) vertices2D[y][x].edges.push(new Edge(vertices2D[y][x + 1], 1));
                    if (y < lvl.size.y - 1 && lvl.getTile(createVector(x, y + 1)).layer0 != Tile.WALL) vertices2D[y][x].edges.push(new Edge(vertices2D[y + 1][x], 1));
                }
            }

            vertices2D[objectPos.y][objectPos.x].dist = 0;

            while (vertices1D.length != 0) {
                let index = 0;
                let vertex = vertices1D.reduce((prev, current, idx) => {
                    if (prev.dist < current.dist) return prev;
                    index = idx;
                    return current;
                });

                vertices1D.splice(index, 1);
                if (vertex.dist == Infinity) break;
                if (vertex.dist != 0 && [Tile.DOOR_ON, Tile.DOOR_OFF].includes(lvl.getTile(vertex.extraInfo.pos).layer1)) continue;

                for (const edge of vertex.edges) {
                    if (edge.vertex.dist > vertex.dist + edge.dist) {
                        edge.vertex.dist = vertex.dist + edge.dist;
                        edge.vertex.parent = vertex;
                    }
                }
            }

            for (const destObjectPos of objectPosList) {
                let destVertex = vertices2D[destObjectPos.y][destObjectPos.x];

                if (destVertex.dist == 0) continue;
                if (destVertex.dist == Infinity) continue;

                let pathPoints = [];
                let vertex = destVertex;

                while (vertex != null) {
                    pathPoints.unshift(vertex.extraInfo.pos);
                    vertex = vertex.parent;
                }

                connections.push({ from: objectPos, dest: destObjectPos, pathPoints: pathPoints, dist: destVertex.dist });
            }
        }

        return { objectPosList: objectPosList, connections: connections };
    }
}