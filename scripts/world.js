class World {
    constructor(graph, circuit) {
        this.graph = graph;
        this.circuit = circuit;

        for (const vertex of Object.values(this.graph.vertices)) vertex.data.world = this;
    }
}