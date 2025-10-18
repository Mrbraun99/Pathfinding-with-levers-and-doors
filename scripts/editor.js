class Editor {
    static mode = EditorMode.DEFAULT;
    static selected_tile = null;
    static selected_entity = null;
    static wire_src = null;
    static dragged = false;
    static active_button = null;
    static click_position = null;
    static solution = null;

    static mousePressed(event) {
        if (Editor.active_button != null) return;

        Editor.active_button = event.button;
        Editor.click_position = (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) ? { x: floor(mouseX / TILE_SIZE), y: floor(mouseY / TILE_SIZE) } : null;
        Editor.dragged = false;

        switch (Editor.active_button) {
            case MOUSE_BUTTON.LEFT:
                {
                    Editor.mousePressedL(floor(mouseX / TILE_SIZE), floor(mouseY / TILE_SIZE));
                    break;
                }
            case MOUSE_BUTTON.RIGHT:
                {

                    Editor.mousePressedR(floor(mouseX / TILE_SIZE), floor(mouseY / TILE_SIZE));
                    break;
                }
        }
    }

    static mouseReleased(event) {
        if (event.button != Editor.active_button) return;

        switch (Editor.active_button) {
            case MOUSE_BUTTON.LEFT:
                {
                    Editor.mouseReleasedL(floor(mouseX / TILE_SIZE), floor(mouseY / TILE_SIZE));
                    break;
                }
            case MOUSE_BUTTON.RIGHT:
                {
                    Editor.mouseReleasedR(floor(mouseX / TILE_SIZE), floor(mouseY / TILE_SIZE));
                    break;
                }
        }

        Editor.selected_entity = null;
        Editor.active_button = null;
        Editor.click_position = null;
        Editor.dragged = false;
    }

    static update() {
        if (Editor.mode == EditorMode.WIREING) {
            strokeWeight(2);
            stroke(State.color(Editor.wire_src.state));
            fill(State.color(Editor.wire_src.state));

            const src = { x: (Editor.wire_src.x + 0.5) * TILE_SIZE + + Editor.wire_src.offset.x, y: (Editor.wire_src.y + 0.5) * TILE_SIZE + Editor.wire_src.offset.y };

            circle(src.x, src.y, TILE_SIZE / 6);
            line(src.x, src.y, mouseX, mouseY);
        }

        if (Editor.active_button == null) return;
        if (!(mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height)) return;

        if (Editor.click_position && !(floor(mouseX / TILE_SIZE) == Editor.click_position.x && floor(mouseY / TILE_SIZE) == Editor.click_position.y)) {
            Editor.dragged = true;
        }

        switch (Editor.active_button) {
            case MOUSE_BUTTON.LEFT:
                {
                    Editor.mouseDraggedL(floor(mouseX / TILE_SIZE), floor(mouseY / TILE_SIZE));
                    break;
                }
            case MOUSE_BUTTON.RIGHT:
                {
                    Editor.mouseDraggedR(floor(mouseX / TILE_SIZE), floor(mouseY / TILE_SIZE));
                    break;
                }
        }
    }

    static mousePressedL(mx, my) {
        if (Editor.click_position && Editor.mode == EditorMode.ROTATE) {
            const selected_entity = Level.circuit.entities.find(entity => entity.pos.x == Editor.click_position.x && entity.pos.y == Editor.click_position.y);

            if (selected_entity && [Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(selected_entity.tile)) {
                selected_entity.rotation = (selected_entity.rotation + 90) % 360;
            }

            return;
        }

        if (Editor.click_position && Editor.mode == EditorMode.DEFAULT) {
            Editor.selected_entity = Level.circuit.entities.find(entity => entity.pos.x == Editor.click_position.x && entity.pos.y == Editor.click_position.y);
            return;
        }
    }

    static mousePressedR(mx, my) {
        if (Editor.mode == EditorMode.WIREING) {
            const entity = Level.circuit.entities.find(entity => entity.tile != Tile.LEVER && entity.pos.x == Editor.click_position.x && entity.pos.y == Editor.click_position.y);

            if (entity) {
                const predecessor = Level.circuit.entities.find(entity => entity.pos.x == Editor.wire_src.x && entity.pos.y == Editor.wire_src.y);

                switch (entity.tile) {
                    case Tile.DOOR:
                    case Tile.NOT_GATE:
                        {
                            if (entity.predecessors.length == 0) {
                                entity.predecessors.push(predecessor);

                                if (Level.circuit.hasLoop()) {
                                    entity.predecessors.pop();
                                }

                                break;
                            }

                            if (entity.predecessors[0] == predecessor) {
                                entity.predecessors = [];
                            }

                            break;
                        }
                    case Tile.AND_GATE:
                    case Tile.OR_GATE:
                        {
                            const index = entity.predecessors.indexOf(predecessor);

                            if (index == -1) {
                                entity.predecessors.push(predecessor);

                                if (Level.circuit.hasLoop()) {
                                    entity.predecessors.pop();
                                }
                            } else {
                                entity.predecessors.splice(index, 1);
                            }

                            break;
                        }
                }

                Level.circuit.evaluate();
                Level.circuit.prettify();
            }

            Editor.wire_src = null;
            Editor.mode = EditorMode.DEFAULT;
            return
        }


        if (Editor.mode == EditorMode.BUILD || Editor.mode == EditorMode.DEMOLISH || Editor.mode == EditorMode.ROTATE) {
            Editor.mode = EditorMode.DEFAULT;
            Editor.selected_tile = null;
            return;
        }

        if (Editor.mode == EditorMode.DEFAULT) {
            const entity = Level.circuit.entities.find(entity => entity.tile != Tile.DOOR && entity.pos.x == Editor.click_position.x && entity.pos.y == Editor.click_position.y);

            if (entity) {
                Editor.mode = EditorMode.WIREING;

                const offset = entity.tile == Tile.LEVER ? { x: 0, y: 0 } : WIRE_SRC_OFFSET[entity.rotation];

                Editor.wire_src = { x: mx, y: my, "state": entity.state, "offset": offset };
            }

            return;
        }
    }

    static mouseDraggedL(mx, my) {
        if (Editor.mode == EditorMode.BUILD) {
            switch (Editor.selected_tile) {
                case Tile.WALL:
                    {
                        if ((Level.src.x == mx && Level.src.y == my) || (Level.dst.x == mx && Level.dst.y == my)) break;

                        Level.grid[my][mx] = Tile.WALL;
                        break;
                    }
                case Tile.AND_GATE:
                case Tile.OR_GATE:
                case Tile.NOT_GATE:
                case Tile.LEVER:
                case Tile.DOOR:
                    {
                        if ((Level.src.x == mx && Level.src.y == my) || (Level.dst.x == mx && Level.dst.y == my)) break;
                        if (Level.circuit.entities.find(entity => entity.pos.x == mx && entity.pos.y == my)) break;

                        const entity = {
                            "pos": { x: mx, y: my },
                            "tile": Editor.selected_tile,
                            "state": Editor.selected_tile == Tile.NOT_GATE ? State.ON : State.OFF,
                            "predecessors": []
                        };

                        if ([Tile.AND_GATE, Tile.OR_GATE, Tile.NOT_GATE].includes(Editor.selected_tile)) {
                            entity.rotation = 0;
                        }

                        Level.circuit.entities.push(entity);
                        break;
                    }
                case Tile.START_POINT:
                    {
                        if (Level.circuit.entities.find(entity => entity.pos.x == mx && entity.pos.y == my) != null) break;
                        if (Level.grid[my][mx] != null || (Level.dst.x == mx && Level.dst.y == my)) break;

                        Level.src = { x: mx, y: my };
                        break;
                    }
                case Tile.FINISH_POINT:
                    {
                        if (Level.circuit.entities.find(entity => entity.pos.x == mx && entity.pos.y == my) != null) break;
                        if (Level.grid[my][mx] != null || (Level.src.x == mx && Level.src.y == my)) break;

                        Level.dst = { x: mx, y: my };
                        break;
                    }
            }

            return;
        }

        if (Editor.mode == EditorMode.DEMOLISH) {
            const remove_entity = Level.circuit.entities.find(entity => entity.pos.x == mx && entity.pos.y == my);

            if (remove_entity) {
                for (const entity of Level.circuit.entities) {
                    entity.predecessors = entity.predecessors.filter(entity => entity != remove_entity);
                }

                Level.circuit.entities = Level.circuit.entities.filter(entity => entity != remove_entity);
                Level.circuit.evaluate();
            }

            Level.grid[my][mx] = null;
        }

        if (Editor.mode == EditorMode.DEFAULT && Editor.selected_entity != null) {
            if (Level.circuit.entities.find(entity => entity.pos.x == mx && entity.pos.y == my) == null && !((Level.src.x == mx && Level.src.y == my) || (Level.dst.x == mx && Level.dst.y == my))) {
                let x = Editor.selected_entity.pos.x;
                let y = Editor.selected_entity.pos.y;

                Editor.selected_entity.pos = { x: mx, y: my };
                if (x != mx || y != my) Level.circuit.prettify();
            }

            return;
        }
    }

    static mouseDraggedR(mx, my) {

    }

    static mouseReleasedL(mx, my) {
        if (Editor.mode == EditorMode.DEFAULT && !Editor.dragged) {
            const lever = Level.circuit.entities.find(entity => entity.tile == Tile.LEVER && entity.pos.x == mx && entity.pos.y == my);

            if (lever) {
                lever.state = State.change(lever.state);
                Level.circuit.evaluate();
            }
        }
    }

    static mouseReleasedR() {

    }

    static display() {
        if (Editor.mode == EditorMode.BUILD) {
            tint(255, 128);
            image(images[Editor.selected_tile], Math.floor(mouseX / TILE_SIZE) * TILE_SIZE, Math.floor(mouseY / TILE_SIZE) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            noTint();
            return;
        }

        if (Editor.mode == EditorMode.DEMOLISH) {
            tint(255, 128);
            image(images["BULLDOZER"], int(mouseX / TILE_SIZE) * TILE_SIZE, int(mouseY / TILE_SIZE) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            noTint();
            return;
        }

        if (Editor.mode == EditorMode.ROTATE) {
            tint(255, 128);
            image(images["ROTATION"], int(mouseX / TILE_SIZE) * TILE_SIZE, int(mouseY / TILE_SIZE) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            noTint();
            return;
        }

        if (Editor.mode == EditorMode.VISUALIZATION) {
            const [x, y] = Editor.solution.player.split(",").map(value => parseInt(value));

            image(images["PLAYER"], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            return;
        }
    }
}