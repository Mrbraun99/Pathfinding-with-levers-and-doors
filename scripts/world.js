class World {
    constructor(lvl, minGraph, parent) {
        this.lvl = lvl.clone();
        this.vertices = [];
        this.leverInteractions = [];
        this.id = "";

        let vertices2D = JSlib.create2DArray(this.lvl.size, null);

        for (const objectPos of minGraph.objectPosList) {
            let vertex = new Vertex({ pos: objectPos, world: this });
            this.vertices.push(vertex);
            vertices2D[objectPos.y][objectPos.x] = vertex;
        }

        for (const connection of minGraph.connections) {
            let fromVertex = vertices2D[connection.from.y][connection.from.x];
            let destVertex = vertices2D[connection.dest.y][connection.dest.x];
            let dist = connection.dist;

            fromVertex.edges.push(new Edge(destVertex, dist));
        }

        if (parent != null) {
            this.lvl.pullLever(parent.extraInfo.pos);

            let x = parent.extraInfo.pos.x;
            let y = parent.extraInfo.pos.y;

            this.id += x + "|" + y + "|";

            vertices2D[y][x].dist = parent.dist + 0.0001;
            vertices2D[y][x].parent = parent;
        } else {
            let x = this.lvl.startPoint.x
            let y = this.lvl.startPoint.y;

            vertices2D[y][x].dist = 0;
        }

        for (const objectPos of minGraph.objectPosList) {
            if ([Tile.LEVER_ON, Tile.LEVER_OFF].includes(this.lvl.getTile(objectPos).layer1)) {
                this.id += this.lvl.getTile(objectPos).layer1 == Tile.LEVER_ON ? "1" : "0";
            }
        }
    }

    hasLeverInteraction(pos) {
        return this.leverInteractions.find(p => p.equals(pos)) != null;
    }

    clearLeverInteractions() {
        this.leverInteractions = [];
    }
}