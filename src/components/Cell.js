import { Container } from '../Container';
import { Rect } from '../Factory';
import { Text } from '@pixi/text';


export class Cell extends Container {

    constructor(data) {
        super();

        this.data = data;

        this.isSelected = false;

        this.cell            = null;
        this.backlight       = null;
        this.backlightSplash = null;/**/

        this.init();
    }

    set data(data) {
        const { type, i = -1, j = -1, color, cellSizes, line, lineColor, isEmpty } = data;

        this.type      = type;
        this.isEmpty   = isEmpty;
        this.cellSizes = cellSizes;
        this.color     = color;
        this.line      = line;
        this.lineColor = lineColor;
        this.i         = i;
        this.j         = j;
    }

    get data() {
        const { type, i, j, color, cellSizes, line, lineColor } = this;
        return { type, i, j, color, cellSizes, line, lineColor };
    }

    static validateCell(i, j) {
        return i >= 0 && j >= 0;
    }

    get indexes() {
        const { i, j } = this;
        return (Cell.validateCell(i, j) ? { i, j } : null);
    }

    init() {
        this.cell            = this.addChild(this.createCell({ color: this.color }));
        // this.backlight       = this.addChild(this.createCell({ color: 0xff0000, alpha: 0.4 }));
        this.backlightSplash = this.addChild(this.createCell({ color: 0x00ff00, alpha: 0.4 }));

        // this.backlight.visible       = false;
        this.backlightSplash.visible = false;

        this.on('pointerdown', this.pointerHandler, this);
        this.addMarkup();
    }

    removeView() {
        this.removeChild(this.cell);
        //  this.removeChild( this.backlight);
        this.removeChild(this.backlightSplash);

        this.off('pointerdown', this.pointerHandler, this);
        this.removeMarkup();
    }

    createCell({ color, alpha, lineAlpha }) {
        const { type, i, j, cellSizes: { w, h }, line = 0, lineColor } = this;

        return Rect(
            { w: w - line / 2, h: h - line / 2 },
            { color, alpha, line, lineColor, lineAlpha },
        );
    }

    pointerHandler() {
        this.emit('select', this);
    }

    select() {
        // this.backlight.visible = true;
        this.isSelected = true;
    }

    selectSplash() {
        this.backlightSplash.visible = true;
    }

    unselect() {
        // this.backlight.visible       = false;
        this.backlightSplash.visible = false;
        this.isSelected              = false;
    }

    // todo remove after testes
    addMarkup() {
        let color = 0x000000;
        if (this.isEmpty) {
            color = 0x990000;

        }
        this.iD = new Text(this.i, { fill: color, fontSize: 12 });
        this.iD.position.set(-7, 7);
        this.iD.anchor.set(0.5);
        this.cell.addChild(this.iD);

        this.jD = new Text(this.j, { fill: color, fontSize: 12 });
        this.jD.position.set(7, 7);
        this.jD.anchor.set(0.5);
        this.cell.addChild(this.jD);
    }

    removeMarkup() {
        this.cell.removeChild(this.iD);
        this.cell.removeChild(this.jD);
    }

    updateMarkup() {
        this.iD.text = this.i;
        this.jD.text = this.j;
    }

    updateView(oldCell, { cellSizes }) {
        const data = { ...oldCell.data, cellSizes };
        this.data  = data;
        this.removeView();
        this.init();
        // this.isSelected = true;
    }

    static clone(cell, cellSizes) {
        return new Cell({ ...cell.data, cellSizes });
    }

}
