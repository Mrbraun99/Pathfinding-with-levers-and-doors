class FileHandler {
    static exportLevel(lvl) {
        let json = {};

        json["grid"] = JSlib.create2DArray(level.size, null);
        for (let y = 0; y < lvl.size.y; y++) {
            for (let x = 0; x < lvl.size.x; x++) {
                json["grid"][y][x] = lvl.grid[y][x];
            }
        }

        json["wires"] = [];
        for (const wire of lvl.wires) json["wires"].push(wire.toJSON());

        json["startPoint"] = { x: lvl.startPoint.x, y: lvl.startPoint.y };
        json["endPoint"] = { x: lvl.endPoint.x, y: lvl.endPoint.y };

        saveJSON(json, 'level.json');
    }

    static importLevel(file) {
        let json = file.data;

        let lvl = new Level(LEVEL_SIZE);
        for (let y = 0; y < lvl.size.y; y++) {
            for (let x = 0; x < lvl.size.x; x++) {
                lvl.getTile(createVector(x, y)).layer0 = json["grid"][y][x].layer0;
                lvl.getTile(createVector(x, y)).layer1 = json["grid"][y][x].layer1;
            }
        }

        for (const wire of json["wires"]) {
            let w = new Wire(createVector(wire.fromX, wire.fromY), createVector(wire.destX, wire.destY));
            w.setFromOffset(wire.fromOffset);
            w.setDestOffset(wire.destOffset);
            w.state = wire.state;
            lvl.wires.push(w);
        }

        lvl.startPoint = createVector(json["startPoint"].x, json["startPoint"].y);
        lvl.endPoint = createVector(json["endPoint"].x, json["endPoint"].y);
        return lvl;
    }
}