import { Container } from '../Container';
// import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';
import { Rect, Poly, Triangle, Circle } from '../Factory';
import { SelectedCell } from './SelectedCell';
import { log2 } from '@pixi/utils';


export class Controls extends Container {
    #selectedMoveBtn;

    constructor(...args) {
        super(...args);

        this.sizes = { w: 200, h: 600 };

        // console.log(this);
        this.bg = null;

        this.moveTab = null;
        this.left    = null;
        this.right   = null;
        this.up      = null;
        this.down    = null;

        this.sizeTab = null;

        this.isScrolling     = false;
        this.scrollStart     = null;
        this.maxScrollHeight = 0;


        this.selectedCell     = null;
        this.#selectedMoveBtn = null;

        // this.moveSelectBtns = [];
        // this.tabs = [];

        this.init();
    }

    set selectedMoveBtn(btn) {
        this.#selectedMoveBtn = btn;
        this.selectMoveType(btn);
    }

    get selectedMoveBtn() {
        return this.#selectedMoveBtn;
    }

    init() {
        this.initBackground();
        this.initTabs();
    }

    initBackground() {
        this.bg             = Rect(
            { w: this.sizes.w, h: this.sizes.h },
            { color: 0x7743d2 },
        );
        this.bg.interactive = true;

        this.addChild(this.bg);

        const bgName = new Text('SETTINGS');
        this.alignElement(bgName);
        this.bg.addChild(bgName);

        this.bg.on('pointerdown', this.bgPointerDown, this);
        this.bg.on('pointermove', this.bgPointerMove, this);
        this.bg.on('pointerup', this.bgPointerUp, this);
        this.bg.on('pointerupoutside', this.bgPointerUp, this);
    }

    bgPointerDown(e) {
        if (this.isScrolling || !e.target) {
            return;
        }

        this.isScrolling = true;
        this.scrollStart = e.data.getLocalPosition(e.target.parent);

        // console.log(e, 'po down');
        // console.log(e.data.getLocalPosition(e.target.parent));
    }

    bgPointerMove(e) {
        if (!this.isScrolling || !e.target) {
            return;
        }
        const y = e.data.getLocalPosition(e.target.parent).y;

        this.bg.y += y - this.scrollStart.y;
        this.scrollStart.y = y;
    }

    bgPointerUp() {
        this.isScrolling = false;
        this.scrollStart = null;
    }

    initTabs() {
        this.initMoveTab();
        this.initSizeTab();
        this.iniEjectTab();

    }

    initMoveTab() {
        // moves selected row or col
        this.moveTab   = new Container();
        this.moveTab.y = 30;
        this.bg.addChild(this.moveTab);
        this.alignElement(this.moveTab, 10, 40);

        const moveName = new Text('Move', { fontSize: 18 });
        this.moveTab.addChild(moveName);


        this.left  = this.createMoveBtn('move', { name: 'left',dj: -1 }, 50, 60);
        this.right = this.createMoveBtn('move', { name: 'right', dj: 1 }, 130, 60, Math.PI);
        this.up    = this.createMoveBtn('move', { name: 'up', di: -1 }, 90, 20, Math.PI / 2);
        this.down  = this.createMoveBtn('move', { name: 'down', di: 1 }, 90, 100, -Math.PI / 2);

        this.selectedCell = this.createSelectedCell('cell', 90, 60, 30);
        this.selectedRow  = this.createMoveSelectBtn('row', 10, 100,
            [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [3, 3, 3, 3, 3], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        );
        this.selectedCol  = this.createMoveSelectBtn('col', 140, 100,
            [[0, 0, 3, 0, 0], [0, 0, 3, 0, 0], [0, 0, 3, 0, 0], [0, 0, 3, 0, 0], [0, 0, 3, 0, 0]],
        );
    }

    selectMoveType(btn) {
        // console.log(([this.selectedCell.outline, this.selectedRow.outline, this.selectedCol.outline]))
        [this.selectedCell, this.selectedRow, this.selectedCol].forEach(btn => btn.outline.visible = false);

        btn.outline.visible = true;
        this.emit('selectMove', btn);

    }

    createMoveSelectBtn(name, x, y, matrix) {
        const btn = this.createBtnHint(matrix);
        this.moveTab.addChild(btn);
        btn.position.set(x, y);
        btn.name = name;
        this.createOutline(btn, { x: 20, y: 10, w: 55, h: 55 });
        btn.on('pointerdown', () => {
            this.selectMoveType(btn);
        });
        return btn;
    }

    createOutline(btn, { x, y, w, h }) {
        const outline   = Rect({ x, y, w, h }, { alpha: 0, line: 4, lineColor: 0x00ff00 });
        outline.visible = false;
        btn.outline     = outline;
        btn.addChild(outline);
    }

    createSelectedCell(name, x, y, s) {
        const selected = new SelectedCell({ cellSizes: { w: s, h: s }, line: 1, color: 0xcccccc });
        this.moveTab.addChild(selected);
        selected.position.set(x, y);
        selected.name = name;
        this.createOutline(selected, { x: 0, y: 0, w: 34, h: 34 });
        selected.on('pointerdown', () => {
            this.selectMoveType(selected);
        });
        return selected;
    }

    selectCell(cell) {
        this.moveTab.removeChild(this.selectedCell);
        this.selectedCell.updateView(cell, { cellSizes: { w: 30, h: 30 } });
        this.selectedCell.position.set(90, 60);
        this.moveTab.addChild(this.selectedCell);
        this.createOutline(this.selectedCell, { x: 0, y: 0, w: 34, h: 34 });

        if (!this.selectedMoveBtn) this.selectedMoveBtn = this.selectedCell;

    }

    unselectCell() {
        this.moveTab.removeChild(this.selectedCell);
        this.selectedCell = this.createSelectedCell('selected', 90, 60, 30);
    }

    createMoveBtn(name, dir, x = 0, y = 0, angle = 0) {
        const btn = Triangle(15, { color: 0x993300, angle });
        btn.position.set(x, y);
        this.moveTab.addChild(btn);
        btn.name        = name;
        btn.dir         = dir;
        btn.interactive = true;
        btn.on('pointerdown', () => {
            const cell = this.selectedCell.indexes;
            this.emit(name, { dir: btn.dir, cell });
        });

        return btn;
    }

    initSizeTab() {
        this.sizeTab = new Container();
        this.alignElement(this.sizeTab, 10, 200);

        this.bg.addChild(this.sizeTab);

        const sizeName = new Text('Size', { fontSize: 18 });
        this.sizeTab.addChild(sizeName);

        this.createSizeBlock('left', 0, 50, [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]]);

        this.createSizeBlock('right', 100, 50, [[0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1]]);

        this.createSizeBlock('up', 0, 100, [[1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);

        this.createSizeBlock('down', 100, 100, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1]]);
    }

    createSizeBlock(name, x, y, matrix) {
        const container = new Container();
        container.position.set(x, y);
        container.anchor.set(0.5);
        this.sizeTab.addChild(container);

        const plus = this.createSizeBtn(name, '+', matrix, false, 0);
        container.addChild(plus);

        const minus = this.createSizeBtn(name, '-', matrix, true, 50);
        container.addChild(minus);
    }

    createBtnHint(matrix) {
        const container = new Container();
        const colors    = [0xcccccc, 0xff0000, 0x00ff00, 0x0000ff];

        matrix.forEach((row, i) => {
            row.forEach((cell, j) => {
                const rect = Rect(
                    { y: -10, w: 10, h: 10 },
                    { color: (colors[ cell ]), line: 1 },
                );
                rect.position.set(j * 10, i * 10);
                container.addChild(rect);
            });
        });
        return container;
    }

    createSizeBtn(name, dir, matrix, remove, x = 0, y = 0) {
        const updateMatrix = matrix.map((row) => row.map((cell) => (!remove && cell ? cell + 1 : cell)));
        const btn          = this.createBtnHint(updateMatrix);

        btn.position.set(x, y);
        btn.name        = name;
        btn.dir         = dir;
        btn.interactive = true;
        btn.on('pointerdown', () => {
            this.emit('addCells', { name, dir });
        });

        return btn;
    }

    iniEjectTab() {
        // todo add eject tab
        this.ejectTab = new Container();
        this.alignElement(this.ejectTab, 10, 350);

        this.bg.addChild(this.ejectTab);

        const ejectName = new Text('Eject', { fontSize: 18 });
        this.ejectTab.addChild(ejectName);

        this.createEjectBtn('eject', 70, 70);
    }

    createEjectBtn(name, x = 0, y = 0) {
        const btn = Circle(
            { r: 25 },
            { color: 0xffffff, line: 1 },
        );
        btn.position.set(x, y);
        this.ejectTab.addChild(btn);
        btn.name        = name;
        btn.interactive = true;
        btn.on('pointerdown', () => {
            this.emit(name);
        });


        const logo1 = Triangle(13, { color: 0x000000, angle: Math.PI / 2 });
        logo1.position.set(-11, -20);
        btn.addChild(logo1);

        const logo2 = Rect({ x: -10, w: 26, h: 7 }, { color: 0x000000 });
        btn.addChild(logo2);
        return btn;
    }

    alignElement(el, x = 0, y = 0) {
        const { w, h } = this.sizes;
        if (el.parent) {
            el.position.set(
                el.width / 4 - el.parent.width / 2 + x,
                el.height / 4 - el.parent.height / 2 + y,
            );
        } else {
            el.position.set(
                el.width / 4 - w / 2 + x,
                el.height / 4 - h / 2 + y,
            );
        }
    }

    onResize({ x = 0, y = 0 }) {
        const { w, h } = this.sizes;


        // this.position.set(x, y);
    }


    // tick methods

    scrollBackground(delta) {
        if (this.bg.y > 0) {
            this.bg.y -= this.bg.y / 10;
        } else if (this.bg.y < -this.maxScrollHeight) {
            this.bg.y += (this.maxScrollHeight - this.bg.y) / 10;
        }
    }

    tick(delta) {

        if (!this.isScrolling) {
            this.scrollBackground(delta);
        }
    }
}
