class World {
    constructor(graph, node, evaluator, state) {
        this.nodes = {};
        this.state = state;
        this.doors = evaluator.evaluate(state);

        for (const pos of Object.keys(graph)) {
            this.nodes[pos] = {
                "pos": pos,
                "distance": Infinity,
                "visited": false,
                "valid": true,
                "parent": null,
                "world": this
            };
        }

        if (node) {
            this.nodes[node.pos].distance = node.distance + 0.01;
            this.nodes[node.pos].parent = node;
        }
    }
}