const AnimationMode = Object.freeze({
    MANUAL: "MANUAL",
    AUTOMATIC: "AUTOMATIC"
});

const Action = Object.freeze({
    MOVE: "MOVE",
    PULL_LEVER: "PULL_LEVER"
});

class RouteVisualizer {
    constructor() {
        this.animationMode = AnimationMode.MANUAL;
        this.playerPos = null;
        this.steps = null;
        this.callback = null;
        this.intervalId = null;
    }

    start(steps, animationMode, callback) {
        this.animationMode = animationMode;
        this.playerPos = steps[0];
        this.steps = steps;
        this.callback = callback;

        if (this.animationMode == AnimationMode.AUTOMATIC) this.intervalId = setInterval(() => this.step(), 300);
    }

    cancel() {
        if (this.animationMode == AnimationMode.AUTOMATIC) clearInterval(this.intervalId);
        this.steps = null;
        this.callback();
    }

    step() {
        if (this.steps == null) return;
        this.steps.shift();

        if (this.steps.length == 0) {
            this.cancel();
            return;
        }

        switch (this.steps[0].action) {
            case Action.MOVE:
                {
                    this.playerPos = this.steps[0].pos;
                    break;
                }
            case Action.PULL_LEVER:
                {
                    editor.circuit.interact(this.steps[0].pos);
                    break;
                }
        }
    }

    display() {
        image(images.PLAYER, this.playerPos.x * TILE_SIZE, this.playerPos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
}