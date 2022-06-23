class InputHandler {
    static mousePressed(button, mode) {
        if (mouseX < 0 || mouseY < 0) return;
        if (mouseX > width || mouseY > height) return;
        if (pathVisualizer.isActive()) return;

        let pos = createVector(int(mouseX / TILE_SIZE), int(mouseY / TILE_SIZE));

        if (objectSelector.selectedTile != null && mode == InputMode.LOOP) {
            switch (objectSelector.selectedTile) {
                case Tile.BULLDOZER:
                    {
                        if (button == RIGHT) level.demolishLayer0(pos);
                        if (button == LEFT) level.demolishLayer1(pos);
                        break;
                    }
                default:
                    {
                        if (button == LEFT) level.build(pos, objectSelector.selectedTile);
                        break;
                    }
            }
        }

        if (objectSelector.selectedTile == null && mode == InputMode.ONCE) {
            switch (button) {
                case LEFT:
                    {
                        if ([Tile.LEVER_ON, Tile.LEVER_OFF].includes(level.getTile(pos).layer1)) level.pullLever(pos);
                        break;
                    }
                case RIGHT:
                    {
                        let wire = wireConnector.connect(pos);
                        if (wire != null) level.addWire(wire);
                    }
            }
        }
    }

    static keyPressed(button) {
        switch (button) {
            case 'd':
            case 'D':
                {
                    objectSelector.deselect();
                    break;
                }
            case '1':
                {
                    objectSelector.selectedTile = Tile.BULLDOZER;
                    break;
                }
            case '2':
                {
                    objectSelector.selectedTile = Tile.WALL;
                    break;
                }
            case '3':
                {
                    objectSelector.selectedTile = Tile.DOOR_OFF;
                    break;
                }
            case '4':
                {
                    objectSelector.selectedTile = Tile.LEVER_OFF;
                    break;
                }
            case '5':
                {
                    objectSelector.selectedTile = Tile.AND_GATE;
                    break;
                }
            case '6':
                {
                    objectSelector.selectedTile = Tile.OR_GATE;
                    break;
                }
            case '7':
                {
                    objectSelector.selectedTile = Tile.NOT_GATE;
                    break;
                }
            case '8':
                {
                    objectSelector.selectedTile = Tile.START_POINT;
                    break;
                }
            case '9':
                {
                    objectSelector.selectedTile = Tile.END_POINT;
                    break;
                }
            case ' ':
                {
                    pathVisualizer.step();
                    break;
                }
        }
    }
}