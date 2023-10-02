class TileSelector {
    constructor() {
        this.tile = null;
    }

    display() {
        if (this.tile == null) return;

        let pos;
        if ((pos = LevelEditor.getMouseGridPosition()) == null) return;

        let img;
        switch (this.tile) {
            case Tile.BULLDOZER:
                {
                    img = images.BULLDOZER;
                    break;
                }
            case Tile.WALL:
                {
                    img = images.WALL;
                    break;
                }
            case Tile.LEVER:
                {
                    img = images.LEVER_OFF;
                    break;
                }
            case Tile.DOOR:
                {
                    img = images.DOOR_OFF;
                    break;
                }
            case Tile.AND_GATE:
                {
                    img = images.AND_GATE;
                    break;
                }
            case Tile.OR_GATE:
                {
                    img = images.OR_GATE;
                    break;
                }
            case Tile.NOT_GATE:
                {
                    img = images.NOT_GATE;
                    break;
                }
            case Tile.START_POINT:
                {
                    img = images.START_POINT;
                    break;
                }
            case Tile.FINISH_POINT:
                {
                    img = images.FINISH_POINT;
                    break;
                }
        }

        tint(255, 128);
        image(img, pos.x * TILE_SIZE, pos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        noTint();
    }
}