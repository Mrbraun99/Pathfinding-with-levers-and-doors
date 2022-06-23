class State {
    static OFF = 0;
    static ON = 1;

    static change(state) {
        return (state + 1) % 2;
    }
}

class InputMode {
    static ONCE = 0;
    static LOOP = 1;
}

class Tile {
    static BULLDOZER = 0;
    static GRASS = 1;
    static WALL = 2;
    static LEVER_ON = 3;
    static LEVER_OFF = 4;
    static DOOR_ON = 5;
    static DOOR_OFF = 6;
    static AND_GATE = 7;
    static OR_GATE = 8;
    static NOT_GATE = 9;
    static START_POINT = 10;
    static END_POINT = 11;
}

const TILE_SIZE = 80;
const LEVEL_SIZE = { x: 25, y: 25 };

var images = [];
var playerImg;

function preload() {
    images[Tile.BULLDOZER] = loadImage("assets/bulldozer.png");
    images[Tile.GRASS] = loadImage("assets/grass.png");
    images[Tile.WALL] = loadImage("assets/wall.png");
    images[Tile.LEVER_ON] = loadImage("assets/lever_on.png");
    images[Tile.LEVER_OFF] = loadImage("assets/lever_off.png");
    images[Tile.DOOR_ON] = loadImage("assets/door_open.png");
    images[Tile.DOOR_OFF] = loadImage("assets/door_closed.png");
    images[Tile.AND_GATE] = loadImage("assets/and_gate.png");
    images[Tile.OR_GATE] = loadImage("assets/or_gate.png");
    images[Tile.NOT_GATE] = loadImage("assets/not_gate.png");
    images[Tile.START_POINT] = loadImage("assets/start.png");
    images[Tile.END_POINT] = loadImage("assets/end.png");

    playerImg = loadImage("assets/player.png");
}

var level;
var objectSelector;
var wireConnector;
var pathVisualizer;

function setup() {
    let canvas = createCanvas(LEVEL_SIZE.x * TILE_SIZE, LEVEL_SIZE.y * TILE_SIZE).parent("#canvasp");
    level = new Level(createVector(LEVEL_SIZE.x, LEVEL_SIZE.y));
    objectSelector = new ObjectSelector();
    wireConnector = new WireConnector();
    pathVisualizer = new PathVisualizer();

    select("#bulldozer").mousePressed(() => objectSelector.selectedTile = Tile.BULLDOZER);
    select("#building_0").mousePressed(() => objectSelector.selectedTile = Tile.WALL);
    select("#building_1").mousePressed(() => objectSelector.selectedTile = Tile.DOOR_OFF);
    select("#building_2").mousePressed(() => objectSelector.selectedTile = Tile.LEVER_OFF);
    select("#building_3").mousePressed(() => objectSelector.selectedTile = Tile.AND_GATE);
    select("#building_4").mousePressed(() => objectSelector.selectedTile = Tile.OR_GATE);
    select("#building_5").mousePressed(() => objectSelector.selectedTile = Tile.NOT_GATE);
    select("#start").mousePressed(() => objectSelector.selectedTile = Tile.START_POINT);
    select("#end").mousePressed(() => objectSelector.selectedTile = Tile.END_POINT);

    select("#download_template_level").mousePressed(() => {
        loadStrings('assets/template_level.json', (lines) => {
            let writer = createWriter("template_level.json");
            for (const line of lines) writer.write(line);
            writer.close();
        });
    });

    select("#export").mousePressed(() => FileHandler.exportLevel(level));

    canvas.drop((file) => {
        if (pathVisualizer.isActive()) return;
        level = FileHandler.importLevel(file);
    });

    select("#calculate_the_shortest_path").mousePressed(() => {
        objectSelector.deselect();

        let path = Pathfinding.getShortestPath(level);
        path == null ? alert("No path found") : pathVisualizer.activate(path);
    });

    select("#cancel_visualization").mousePressed(() => pathVisualizer.cancel());
}

function draw() {
    level.display();
    objectSelector.display();
    wireConnector.display();
    pathVisualizer.display();

    if (mouseIsPressed) InputHandler.mousePressed(mouseButton, InputMode.LOOP);
}

function mousePressed() {
    InputHandler.mousePressed(mouseButton, InputMode.ONCE);
}

function keyPressed() {
    InputHandler.keyPressed(key);
}