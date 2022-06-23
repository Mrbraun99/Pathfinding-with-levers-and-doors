class ObjectSelector {
    constructor() {
        this.selectedTile = null;
    }

    deselect() {
        this.selectedTile = null;
    }

    display() {
        if (this.selectedTile == null) return;

        imageMode(CENTER);
        tint(255, 128);
        image(images[this.selectedTile], int(mouseX / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2, int(mouseY / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
        noTint();
    }
}