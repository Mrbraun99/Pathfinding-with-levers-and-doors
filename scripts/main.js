const Tile = Object.freeze({
    WALL: "WALL",
    LEVER: "LEVER",
    DOOR: "DOOR",
    AND_GATE: "AND_GATE",
    OR_GATE: "OR_GATE",
    NOT_GATE: "NOT_GATE",
    START_POINT: "START_POINT",
    FINISH_POINT: "FINISH_POINT"
});

const MOUSE_BUTTON = Object.freeze({
    RIGHT: 2,
    LEFT: 0
});

const EditorMode = Object.freeze({
    DEFAULT: "DEFAULT",
    BUILD: "BUILD",
    WIREING: "WIREING",
    DEMOLISH: "DEMOLISH",
    ROTATE: "ROTATE",
    VISUALIZATION: "VISUALIZATION"
});

const Step = Object.freeze({
    FORWARD: 1,
    BACKWARD: -1
});

const TILE_SIZE = 35;
const LEVEL_SIZE = { x: 23, y: 23 };
const images = {};
const text_images = {};

const WIRE_SRC_OFFSET = {
    "0": { x: TILE_SIZE / 2, y: 0 },
    "90": { x: 0, y: TILE_SIZE / 2 },
    "180": { x: -TILE_SIZE / 2, y: 0 },
    "270": { x: 0, y: -TILE_SIZE / 2 }
};

const WIRE_DST_OFFSET = {
    "0": { x: -TILE_SIZE / 2, y: 0 },
    "90": { x: 0, y: -TILE_SIZE / 2 },
    "180": { x: TILE_SIZE / 2, y: 0 },
    "270": { x: 0, y: TILE_SIZE / 2 }
};

function preload() {
    images["BULLDOZER"] = loadImage("assets/bulldozer.png");
    images["ROTATION"] = loadImage("assets/rotation.png");
    images["GRASS"] = loadImage("assets/grass.png");
    images["WALL"] = loadImage("assets/wall.png");
    images["LEVER_ON"] = loadImage("assets/lever_on.png");
    images["LEVER_OFF"] = loadImage("assets/lever_off.png");
    images["DOOR_ON"] = loadImage("assets/door_on.png");
    images["DOOR_OFF"] = loadImage("assets/door_off.png");
    images["AND_GATE"] = loadImage("assets/and_gate.png");
    images["OR_GATE"] = loadImage("assets/or_gate.png");
    images["NOT_GATE"] = loadImage("assets/not_gate.png");
    images["START_POINT"] = loadImage("assets/start_point.png");
    images["FINISH_POINT"] = loadImage("assets/finish_point.png");
    images["PLAYER"] = loadImage("assets/player.png");

    images["LEVER"] = images["LEVER_OFF"];
    images["DOOR"] = images["DOOR_OFF"];

    text_images["AND_GATE"] = loadImage("assets/and_gate_text.png");
    text_images["OR_GATE"] = loadImage("assets/or_gate_text.png");
    text_images["NOT_GATE"] = loadImage("assets/not_gate_text.png");
}

function setup() {
    const canvas = createCanvas(LEVEL_SIZE.x * TILE_SIZE, LEVEL_SIZE.y * TILE_SIZE).parent("#canvas-parent");

    select("#load_demo").mousePressed(() => {
        if ([EditorMode.DEFAULT, EditorMode.BUILD, EditorMode.DEMOLISH, EditorMode.ROTATE].includes(Editor.mode)) {
            loadJSON("assets/demo.json", (data) => Level.import(data));
        }
    });

    canvas.drop((file) => {
        if ([EditorMode.DEFAULT, EditorMode.BUILD, EditorMode.DEMOLISH, EditorMode.ROTATE].includes(Editor.mode)) {
            Level.import(file.data);
        }
    });

    for (const build_btn of document.getElementsByClassName("build_btn")) {
        build_btn.addEventListener("click", () => {
            if ([EditorMode.DEFAULT, EditorMode.BUILD, EditorMode.DEMOLISH, EditorMode.ROTATE].includes(Editor.mode)) {
                Editor.mode = EditorMode.BUILD;
                Editor.selected_tile = build_btn.getAttribute("data-tile");
            }
        });
    }

    select("#demolish_btn").mousePressed(() => {
        if ([EditorMode.DEFAULT, EditorMode.BUILD, EditorMode.ROTATE].includes(Editor.mode)) {
            Editor.mode = EditorMode.DEMOLISH;
        }
    });

    select("#rotate_btn").mousePressed(() => {
        if ([EditorMode.DEFAULT, EditorMode.BUILD, EditorMode.DEMOLISH].includes(Editor.mode)) {
            Editor.mode = EditorMode.ROTATE;
        }
    });

    select("#export_level").mousePressed(() => {
        if ([EditorMode.DEFAULT, EditorMode.BUILD, EditorMode.DEMOLISH, EditorMode.ROTATE].includes(Editor.mode)) {
            Level.export();
        }
    });

    select("#solve_level").mousePressed(() => {
        if ([EditorMode.DEFAULT, EditorMode.BUILD, EditorMode.DEMOLISH, EditorMode.ROTATE].includes(Editor.mode)) {
            const path = Pathfinder.search();

            if (path != null) {
                Editor.mode = EditorMode.VISUALIZATION;

                document.getElementById("editor_tools").style.display = "none";
                document.getElementById("animation_tools").style.display = "flex";

                const levers = Level.circuit.entities.filter(entity => entity.tile === Tile.LEVER);

                Editor.solution = {
                    "levers": Object.fromEntries(levers.map(lever => [lever.pos.x + "," + lever.pos.y, lever.state])),
                    "path": path,
                    "index": 0,
                    "player": Level.src.x + "," + Level.src.y,
                    "interval": setInterval(() => { RouteVisualizer.step(Step.FORWARD) }, 300)
                };

                return;
            }

            alert("No solution was found");
        }
    });

    RouteVisualizer.setupControls();
}

function draw() {
    background(0);
    Level.display();

    Editor.update();
    Editor.display();
}

function mousePressed(event) {
    Editor.mousePressed(event);
}

function mouseReleased(event) {
    Editor.mouseReleased(event);
}