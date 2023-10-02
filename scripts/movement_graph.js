class MovementGraph {
    static create(tiles) {
        let graph = new Graph();

        for (let y = 0; y < LEVEL_SIZE.y; y++) {
            for (let x = 0; x < LEVEL_SIZE.x; x++) {
                if (tiles[y][x] != Tile.WALL) graph.addVertex({ x: x, y: y }, { "tile": tiles[y][x] });
            }
        }

        for (let y = 0; y < LEVEL_SIZE.y; y++) {
            for (let x = 0; x < LEVEL_SIZE.x; x++) {
                if (tiles[y][x] == Tile.WALL) continue;

                if (x + 1 < LEVEL_SIZE.x && tiles[y][x + 1] != Tile.WALL) graph.addEdge({ x: x, y: y }, { x: x + 1, y: y }, 1);
                if (y + 1 < LEVEL_SIZE.y && tiles[y + 1][x] != Tile.WALL) graph.addEdge({ x: x, y: y }, { x: x, y: y + 1 }, 1);

                if (x - 1 >= 0 && tiles[y][x - 1] != Tile.WALL) graph.addEdge({ x: x, y: y }, { x: x - 1, y: y }, 1);
                if (y - 1 >= 0 && tiles[y - 1][x] != Tile.WALL) graph.addEdge({ x: x, y: y }, { x: x, y: y - 1 }, 1);
            }
        }

        return graph;
    }
}