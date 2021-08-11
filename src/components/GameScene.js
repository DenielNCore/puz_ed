import { Container } from '../Container';

import { Controls } from './Controls';
import { Scene } from './Scene';


export class GameScene extends Container {
    constructor(...args) {
        super(...args);

        this.scene    = null;
        this.controls = null;

        this.init();
    }

    init() {
        this.initScene();
        this.initControls();
    }

    initScene() {
        this.scene = new Scene();
        this.scene.field.on('select', (e) => {
            // console.log(e);
            this.controls.selectCell(e);
        });
        this.scene.field.on('unselect', () => {
            this.controls.unselectCell();
        });

        this.scene.container.interactive = true;
        this.scene.container.on('pointerdown', (e) => {
            if (e.target === this.scene.container) {
                this.scene.field.unselectAll();
                this.scene.field.selectMoveCell = null;
                this.controls.unselectCell();
            }
        });

        this.addChild(this.scene);
    }

    initControls() {
        this.controls = new Controls();
        this.controls.position.set(300, 0);

        this.controls.on('addCells', (e) => {
            this.scene.field.setLine(e);
        });
        this.controls.on('move', (e) => {
            this.scene.field.moveCells(e);
        });
        this.controls.on('selectMove', (e) => {
            console.log(e);
            this.scene.field.selectMove(e);
        });
        this.controls.on('eject', (e) => {
            this.scene.field.ejectData(e);
        });
        // this.controls.x = 600;
        this.addChild(this.controls);
    }

    /**
     * Every frame change call
     * @param delta { Number } ms count between frames
     */
    tick(delta) {
        if (this.scene && this.scene.tick) this.scene.tick(delta);
        if (this.controls && this.controls.tick) this.controls.tick(delta);
    }

    onResize() {
        if (this.scene && this.scene.onResize) this.scene.onResize();
        if (this.controls && this.controls.onResize) this.controls.onResize({ x: 300 });
    }
}
