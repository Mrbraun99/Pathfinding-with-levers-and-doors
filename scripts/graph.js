class Graph {
    constructor(vertices) {
        this.vertices = vertices ?? {};
    }

    addVertex(pos, data) {
        this.vertices[str(pos.x) + "," + str(pos.y)] = { "pos": { x: pos.x, y: pos.y }, "dist": INFINITY_DISTANCE, "parent": null, "edges": [], "data": data };
    }

    addEdge(src, dst, length) {
        this.vertices[str(src.x) + "," + str(src.y)].edges.push({ "dst": { x: dst.x, y: dst.y }, "length": length });
    }

    getEdges(vertex) {
        let edges = [];
        for (const edge of vertex.edges) edges.push({ "vertex": this.vertices[str(edge.dst.x) + "," + str(edge.dst.y)], "length": edge.length });
        return edges;
    }

    copy() {
        return new Graph(JSON.parse(JSON.stringify(this.vertices)));
    }
}