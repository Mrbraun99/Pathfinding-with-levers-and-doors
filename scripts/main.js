const AppState = Object.freeze({
    EDITOR: "EDITOR",
    VISUALIZATION: "VISUALIZATION"
});

const Tile = Object.freeze({
    BULLDOZER: "BULLDOZER",
    GRASS: "GRASS",
    WALL: "WALL",
    LEVER: "LEVER",
    DOOR: "DOOR",
    AND_GATE: "AND_GATE",
    OR_GATE: "OR_GATE",
    NOT_GATE: "NOT_GATE",
    START_POINT: "START_POINT",
    FINISH_POINT: "FINISH_POINT"
});

class State {
    static OFF = 0;
    static ON = 1;

    static flip(value) {
        return (value == State.OFF) ? State.ON : State.OFF;
    }
}

const INFINITY_DISTANCE = 999999;
const TILE_SIZE = 60;
const LEVEL_SIZE = { x: 24, y: 24 };
const images = {};

function preload() {
    images.BULLDOZER = loadImage("assets/bulldozer.png");
    images.GRASS = loadImage("assets/grass.png");
    images.WALL = loadImage("assets/wall.png");
    images.LEVER_ON = loadImage("assets/lever_on.png");
    images.LEVER_OFF = loadImage("assets/lever_off.png");
    images.DOOR_ON = loadImage("assets/door_on.png");
    images.DOOR_OFF = loadImage("assets/door_off.png");
    images.AND_GATE = loadImage("assets/and_gate.png");
    images.OR_GATE = loadImage("assets/or_gate.png");
    images.NOT_GATE = loadImage("assets/not_gate.png");
    images.START_POINT = loadImage("assets/start_point.png");
    images.FINISH_POINT = loadImage("assets/finish_point.png");
    images.PLAYER = loadImage("assets/player.png");
}

var appState = AppState.EDITOR;
var editor = null;
var tileSelector = null;
var wireConnector = null;
var routeVisualizer = null;

function setup() {
    let canvas = createCanvas(LEVEL_SIZE.x * TILE_SIZE, LEVEL_SIZE.y * TILE_SIZE).parent("#canvas-parent");

    editor = new LevelEditor();
    tileSelector = new TileSelector();
    wireConnector = new WireConnector();
    routeVisualizer = new RouteVisualizer();

    for (let i = 1; i <= 9; i++) select(`#entity_${i}`).mousePressed(() => keyPressed(new KeyboardEvent("keydown", { "key": i })));

    select("#download-template-level").mousePressed(() => {
        loadStrings('assets/template_level.json', (lines) => {
            let writer = createWriter("template_level.json");
            for (const line of lines) writer.write(line);
            writer.close();
        });
    });

    let animationMode;
    if ((animationMode = getItem("auto-visualizing")) != null) select("#auto-visualizing").checked(animationMode == AnimationMode.AUTOMATIC);
    select("#auto-visualizing").changed(() => storeItem("auto-visualizing", (select("#auto-visualizing").checked()) ? AnimationMode.AUTOMATIC : AnimationMode.MANUAL));

    select("#export-level").mousePressed(() => {
        if (appState != AppState.EDITOR) return;
        editor.export();
    });

    canvas.drop((file) => {
        if (appState != AppState.EDITOR) return;
        editor.import(file);
    });

    select("#cancel-visualization").mousePressed(() => {
        if (appState != AppState.VISUALIZATION) return;
        routeVisualizer.cancel();
    });
}

function draw() {
    editor.display();
    tileSelector.display();
    wireConnector.display();
    if (appState == AppState.VISUALIZATION) routeVisualizer.display();
}

function mousePressed() {
    if (appState != AppState.EDITOR) return;

    let pos;
    if ((pos = LevelEditor.getMouseGridPosition()) == null) return;

    if (tileSelector.tile != null && mouseButton == LEFT) {
        switch (tileSelector.tile) {
            case Tile.WALL:
            case Tile.LEVER:
            case Tile.DOOR:
            case Tile.AND_GATE:
            case Tile.OR_GATE:
            case Tile.NOT_GATE:
            case Tile.START_POINT:
            case Tile.FINISH_POINT:
                {
                    if (mouseButton == LEFT) editor.build(pos, tileSelector.tile);
                    return
                }
            case Tile.BULLDOZER:
                {
                    if (mouseButton == LEFT) editor.destroy(pos);
                    return;
                }
        }
    }

    if (tileSelector.tile != null && mouseButton == RIGHT) {
        tileSelector.tile = null;
        return;
    }

    if (tileSelector.tile == null && mouseButton == LEFT) {
        editor.circuit.interact(pos);
        return;
    }

    if (tileSelector.tile == null && mouseButton == RIGHT) {
        let wire;
        if ((wire = wireConnector.connect(pos)) != null) editor.circuit.connect(wire);
        return;
    }
}

function mouseDragged() {
    if (appState != AppState.EDITOR) return;

    let pos;
    if ((pos = LevelEditor.getMouseGridPosition()) == null) return;

    if (tileSelector.tile != null && mouseButton == LEFT) {
        switch (tileSelector.tile) {
            case Tile.WALL:
            case Tile.LEVER:
            case Tile.DOOR:
            case Tile.AND_GATE:
            case Tile.OR_GATE:
            case Tile.NOT_GATE:
            case Tile.START_POINT:
            case Tile.FINISH_POINT:
                {
                    if (mouseButton == LEFT) editor.build(pos, tileSelector.tile);
                    return
                }
            case Tile.BULLDOZER:
                {
                    if (mouseButton == LEFT) editor.destroy(pos);
                    return;
                }
        }
    }
}

function keyPressed(event) {
    switch (event.key) {
        case "Enter":
            {
                if (appState == AppState.EDITOR) {
                    tileSelector.tile = null;
                    wireConnector.state = WireConnectorState.ZERO_CONNECTION;

                    let steps;
                    if ((steps = Pathfinder.search(editor.tiles, editor.circuit)) != null) {
                        let circuit = editor.circuit.copy();
                        appState = AppState.VISUALIZATION;

                        routeVisualizer.start(steps, (select("#auto-visualizing").checked()) ? AnimationMode.AUTOMATIC : AnimationMode.MANUAL, () => {
                            editor.circuit = circuit;
                            appState = AppState.EDITOR;
                        });

                        break;
                    }

                    alert("No path found");
                }
                break;
            }
        case " ":
            {
                if (appState == AppState.VISUALIZATION && routeVisualizer.animationMode == AnimationMode.MANUAL) routeVisualizer.step();
                break;
            }
        case "1":
            {
                if (appState == AppState.EDITOR) {
                    tileSelector.tile = Tile.BULLDOZER;
                    wireConnector.state = WireConnectorState.ZERO_CONNECTION;
                }
                break;
            }
        case "2":
            {
                if (appState == AppState.EDITOR) {
                    tileSelector.tile = Tile.WALL;
                    wireConnector.state = WireConnectorState.ZERO_CONNECTION;
                }
                break;
            }
        case "3":
            {
                if (appState == AppState.EDITOR) {
                    tileSelector.tile = Tile.LEVER;
                    wireConnector.state = WireConnectorState.ZERO_CONNECTION;
                }
                break;
            }
        case "4":
            {
                if (appState == AppState.EDITOR) {
                    tileSelector.tile = Tile.DOOR;
                    wireConnector.state = WireConnectorState.ZERO_CONNECTION;
                }
                break;
            }
        case "5":
            {
                if (appState == AppState.EDITOR) {
                    tileSelector.tile = Tile.AND_GATE;
                    wireConnector.state = WireConnectorState.ZERO_CONNECTION;
                }
                break;
            }
        case "6":
            {
                if (appState == AppState.EDITOR) {
                    tileSelector.tile = Tile.OR_GATE;
                    wireConnector.state = WireConnectorState.ZERO_CONNECTION;
                }
                break;
            }
        case "7":
            {
                if (appState == AppState.EDITOR) {
                    tileSelector.tile = Tile.NOT_GATE;
                    wireConnector.state = WireConnectorState.ZERO_CONNECTION;
                }
                break;
            }
        case "8":
            {
                if (appState == AppState.EDITOR) {
                    tileSelector.tile = Tile.START_POINT;
                    wireConnector.state = WireConnectorState.ZERO_CONNECTION;
                }
                break;
            }
        case "9":
            {
                if (appState == AppState.EDITOR) {
                    tileSelector.tile = Tile.FINISH_POINT;
                    wireConnector.state = WireConnectorState.ZERO_CONNECTION;
                }
                break;
            }
    }
}