class RouteVisualizer {
    static setupControls() {
        select("#step_f").mousePressed(() => {
            RouteVisualizer.step(Step.FORWARD, true);
        });

        select("#step_b").mousePressed(() => {
            RouteVisualizer.step(Step.BACKWARD, true);
        });

        select("#cancel").mousePressed(() => {
            Editor.mode = EditorMode.DEFAULT;

            for (const [pos, state] of Object.entries(Editor.solution.levers)) {
                const [x, y] = pos.split(",").map(value => parseInt(value));
                Level.circuit.entities.find(entity => entity.tile == Tile.LEVER && entity.pos.x == x && entity.pos.y == y).state = state;
            }
            Level.circuit.evaluate();

            clearInterval(Editor.solution.interval);
            Editor.solution = null;

            document.getElementById("editor_tools").style.display = "block";
            document.getElementById("animation_tools").style.display = "none";
            document.getElementById("play").style.display = "none";
            document.getElementById("stop").style.display = "block";
        });

        select("#replay").mousePressed(() => {
            for (const [pos, state] of Object.entries(Editor.solution.levers)) {
                const [x, y] = pos.split(",").map(value => parseInt(value));
                Level.circuit.entities.find(entity => entity.tile == Tile.LEVER && entity.pos.x == x && entity.pos.y == y).state = state;
            }
            Level.circuit.evaluate();

            Editor.solution.index = 0;
            Editor.solution.player = Level.src.x + "," + Level.src.y;
        });

        select("#stop").mousePressed(() => {
            clearInterval(Editor.solution.interval);
            Editor.solution.interval = null;

            document.getElementById("play").style.display = "block";
            document.getElementById("stop").style.display = "none";
        });

        select("#play").mousePressed(() => {
            Editor.solution.interval = setInterval(() => { RouteVisualizer.step(Step.FORWARD) }, 300)

            document.getElementById("play").style.display = "none";
            document.getElementById("stop").style.display = "block";
        });
    }


    static step(direction, manual = false) {
        if (manual) {
            clearInterval(Editor.solution.interval);
            Editor.solution.interval = null;

            document.getElementById("play").style.display = "block";
            document.getElementById("stop").style.display = "none";
        }

        Editor.solution.index += direction;

        if (Editor.solution.index == Editor.solution.path.length || Editor.solution.index < 0) {
            Editor.solution.index -= direction;
            return;
        }

        if (Editor.solution.path[Editor.solution.index] == "PULL_LEVER") {
            const [x, y] = Editor.solution.player.split(",").map(value => parseInt(value));
            const lever = Level.circuit.entities.find(entity => entity.tile == Tile.LEVER && entity.pos.x == x && entity.pos.y == y);

            lever.state = State.change(lever.state);
            Level.circuit.evaluate();

            Editor.solution.index += direction;
            return;
        }

        Editor.solution.player = Editor.solution.path[Editor.solution.index];
    }
}