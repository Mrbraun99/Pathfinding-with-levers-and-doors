class Vertex {
    constructor(extraInfo = null) {
        this.dist = Infinity;
        this.edges = [];
        this.parent = null;
        this.extraInfo = extraInfo;
    }
}