import { Container } from '../Container';
// import { Rect } from '../Factory';
import { Cell } from './Cell';

// todo STATE MANAGER

export class Field extends Container {
    #fieldShift;
    #selectMoveCellType;

    constructor(data, sizes) {
        super();

        const { matrix, cellSizes, defaultCell, emptyCell } = data;

        this.data      = data;
        this.limitSize = { w: sizes.w, h: sizes.h };

        this.cellSizes   = cellSizes;
        this.defaultCell = defaultCell;
        this.emptyCell   = emptyCell;
        this.matrix      = matrix;
        this.blocks      = [];

        this.container = null;
        this.field     = null;

        this.selectMoveCellType = null;

        this.init();
    }

    get emptyConfig() {
        return { ...this.emptyCell, isEmpty: true };
    }

    init() {
        this.initContainer();
        this.updateMatrix();
        this.updateView();
    }

    initContainer() {
        this.container = this.addChild(new Container());
    }

    createCell(config) {
        const cell = this.container.addChild(new Cell({ ...config }));
        cell.on('select', this.selectCell, this);
        return cell;
    }

    removeCell(cell) {
        cell.off('select', this.selectCell, this);
        if (cell.isSelected) {
            this.emit('unselect');
        }
        this.container.removeChild(cell);
    }

    selectCell(cell) {
        this.emit('select', cell);
        this.unselectAll();
        this.selectSplash(cell);
        cell.select();
    }

    selectSplash(cell) {
        this.removeCellFromArr([...this.getRowCells(cell), ...this.getColCells(cell)], cell)
            .forEach(cell => cell.selectSplash());
    }

    getRowCells({ i }) {
        return [...this.field[ i ]];
    }

    getColCells({ j }) {
        return this.field.reduce((acc, curRow) => [...acc, curRow[ j ]], []);
    }

    removeCellFromArr(list, { i, j }) {
        return list.filter(cell => !(cell.i === i && cell.j === j));
    }

    unselectAll() {
        this.blocks.forEach(cell => cell.unselect());
    }

    updateMatrix() {
        this.field = this.matrix.map((row) => {
            return row.map((cell) => {
                return this.createCell(cell);
            });
        });

        this.updateIndexes();
        this.updateShift();
    }

    updateView() {
        this.blocks.forEach(block => {
            const { i, j } = block;
            block.position.set(
                (j - this.fieldShift.j) * this.cellSizes.w,
                (i - this.fieldShift.i) * this.cellSizes.h,
            );
        });
    }

    // validateWord() {}
    updateShift() {
        this.fieldShift = {
            i: (this.field.length - 1) / 2,
            j: (this.field[ 0 ].length - 1) / 2,
        };
    }

    set fieldShift(value) {
        this.#fieldShift = value;
    }

    get fieldShift() {
        return this.#fieldShift;
    }

    setLine(data) {
        this.addLine(data);
        this.updateIndexes();
    }

    addLine({ name, dir }, empty = false) {
        switch (name) {
            case 'left':
                this.updateLeft(dir, empty);
                break;
            case 'right':
                this.updateRight(dir, empty);
                break;
            case 'up':
                this.updateUp(dir, empty);
                break;
            case 'down':
                this.updateDown(dir, empty);
                break;
            default:
                break;
        }
    }

    updateIndexes() {
        if (!this.field.length || !this.field[ 0 ].length) {
            return;
        }
        this.blocks = [];
        this.updateShift();
        this.cutEmpty();
        this.updateFieldScale();

        this.field.forEach((row, i) => {
            row.forEach((cell, j) => {
                cell.i = i;
                cell.j = j;
                this.blocks.push(cell);
                cell.position.set(
                    (j - this.fieldShift.j) * this.cellSizes.w,
                    (i - this.fieldShift.i) * this.cellSizes.h,
                );
                cell.updateMarkup();
                if (cell.isSelected) this.selectCell(cell);
            });
        });
    }

    cutEmpty() { //todo
        // console.dir(this.field);
        // console.table(this.field);
        // horizontal
        const row = this.field.reduce((acc, cur, i) => {
            // console.log(cur.every(cell => cell.isEmpty))
            // console.log(i);
            return (cur.every(cell => {
                // console.log(cell.isEmpty);
                return cell.isEmpty;
            }) ? [...acc, i] : acc);
        }, []);
        // console.log(row);
        // vertical
        const cols = this.field[ 0 ].reduce((acc, cur, j) => {
            return (this.getColCells({ j })
                .every(cell => cell.isEmpty) ? [...acc, j] : acc);
        }, []);
        // console.log(cols);
    }

    getTrimLines(list) { //todo
        list.reduce((acc, cur) => {

            // return { start: [...acc.start], end: [...acc.end]}
            // }, {});
            return { start: [...acc.start], end: [...acc.end] };
        }, { start: [], end: [] });
    }

    updateFieldScale() {
        const w = this.cellSizes.w * this.field[ 0 ].length;
        const h = this.cellSizes.h * this.field.length;

        const scale = Math.min(...[this.limitSize.w / w, this.limitSize.h / h, 1]);

        this.container.scale.set(scale);
    }

    updateLeft(dir, empty) {
        const cellConfig = (empty ? this.emptyConfig : this.defaultCell);

        if (dir === '+') {

            this.field.forEach((row) => {
                const block = this.createCell(cellConfig);
                row.unshift(block);
            });
        } else {
            this.field.forEach((row) => {
                const [cell] = row.splice(0, 1);
                this.removeCell(cell);
            });
        }
    }

    updateRight(dir, empty) {
        const cellConfig = (empty ? this.emptyConfig : this.defaultCell);

        if (dir === '+') {
            this.field.forEach((row) => {
                const block = this.createCell(cellConfig);
                row.push(block);
            });
        } else {
            this.field.forEach((row) => {
                const [cell] = row.splice(row.length - 1, 1);
                this.removeCell(cell);
            });
        }
    }

    updateUp(dir, empty) {
        const cellConfig = (empty ? this.emptyConfig : this.defaultCell);

        if (dir === '+') {
            const newRow = Array.from({ length: this.field[ 0 ].length }, () => this.createCell(cellConfig));
            this.field.unshift(newRow);
        } else {
            if (!this.field.length) {
                return;
            }
            const [oldRow] = this.field.splice(0, 1);
            oldRow.forEach((cell) => {
                this.removeCell(cell);
            });
        }
    }

    updateDown(dir, empty) {
        const cellConfig = (empty ? this.emptyConfig : this.defaultCell);

        if (dir === '+') {
            const newRow = Array.from({ length: this.field[ 0 ].length }, () => this.createCell(cellConfig));
            this.field.push(newRow);
        } else {
            if (!this.field.length) {
                return;
            }
            const [oldRow] = this.field.splice(this.field.length - 1, 1);
            oldRow.forEach((cell) => {
                this.removeCell(cell);
            });
        }
    }

    set selectMoveCellType(cell) {
        this.#selectMoveCellType = cell;

    }

    get selectMoveCellType() {
        return this.#selectMoveCellType;

    }

    selectMove(cell) {
        this.selectMoveCellType = cell.name;
    }

    moveCells(data) {
        const { dir, cell } = data;

        if (!this.selectMoveCellType) return;

        switch (this.selectMoveCellType) {
            case 'cell':
                this.swapCells(cell, dir);
                break;
            case 'row':
                this.moveRow(cell, dir);
                break;
            case 'col':
                break;
            default:
                break;
        }


        // switch (dir) {
        //     case 'left':
        //         this.moveLeft(cell);
        //         break;
        //     case 'right':
        //         this.moveRight(cell);
        //         break;
        //     case 'up':
        //         this.moveUp(cell);
        //         break;
        //     case 'down':
        //         this.moveDown(cell);
        //         break;
        //     default:
        //         break;
        //
        // }

        // this.updateIndexes();
    }

    validateCell(i, j) {
        return i >= 0 && j >= 0 && i < this.field.length && j < this.field[ 0 ].length;
    }

    swapCells(cell, dir) {
        const { i, j }                 = cell;
        const { di = 0, dj = 0, name } = dir;

        const isInsideField = this.validateCell(i + di, j + dj);
        if (!isInsideField) {
            this.addLine({ name, dir: '+' }, true);
        }

        const toI = (isInsideField ? i + di : i);
        const toJ = (isInsideField ? j + dj : j);

        let fromI = (isInsideField ? i : i - di);
        let fromJ = (isInsideField ? j : j - dj);

        if (name === 'right' || name === 'down') {
            fromI = (isInsideField ? i : i + di);
            fromJ = (isInsideField ? j : j + dj);
        }
        // const fromI = (isInsideField ? i : i - di);
        // const fromJ = (isInsideField ? j : j - dj);

        const oldCell = this.field[ fromI ][ fromJ ];
        const newCell = this.field[ toI ][ toJ ];

        // this.field[ toI ][ toJ ] = oldCell;

        if (name === 'right' || name === 'down') {
            this.field[ toI ][ toJ ]     = oldCell;
            this.field[ fromI ][ fromJ ] = newCell;
        } else {
            this.field[ toI ][ toJ ]     = oldCell;
            this.field[ fromI ][ fromJ ] = newCell;
        }

        this.updateIndexes();

        this.selectCell(oldCell);
    }

    moveRow(cell, dir) {
        const { i, j } = cell;
        const oldCell  = this.field[ i ][ j ];

        this.moveLeft(oldCell);

        // switch (dir) {
        //     case 'left':
        //         this.moveLeft(oldCell);
        //         break;
        //     case 'right':
        //         this.moveRight(cell);
        //         break;
        //     case 'up':
        //         this.moveUp(cell);
        //         break;
        //     case 'down':
        //         this.moveDown(cell);
        //         break;
        //     default:
        //         break;
        //
        // }

        this.updateIndexes();

    }

    moveLeft(cell) {
        console.log(cell);
        this.field.forEach((row, i) => {
            // const block = this.createCell(this.defaultCell);
            const block = this.createCell(this.emptyConfig);

            if (cell.i === i) {
                row.push(block);
            } else {
                row.unshift(block);
            }
            // const block = this.createCell(this.emptyCell);
        });
    }

    moveRight(type) {

        // switch (type) {
        //     case 'cell':
        //         break;
        //     case 'row':
        //         break;
        //     case 'col':
        //         break;
        //     default:
        //         break;
        // }

    }

    moveUp() {

    }

    moveDown() {

    }

    onResize() {

    }


    ejectData(e) {

        console.log('%c Ejected data loaded! ', 'background: #555; color: yellow; font-size: 30px');

        console.dir(this.data);
    }

    // tick methods

    //  colorLog(message, color) {
    //
    //     color = color || "black";
    //
    //     switch (color) {
    //         case "success":
    //             color = "Green";
    //             break;
    //         case "info":
    //             color = "DodgerBlue";
    //             break;
    //         case "error":
    //             color = "Red";
    //             break;
    //         case "warning":
    //             color = "Orange";
    //             break;
    //         default:
    //             color = color;
    //     }
    //
    //     console.dir("%c" + message, "color:" + color);
    // }
    tick(delta) {

        // this.moveCells(delta);
    }

    // moveCells(delta) {
    // // console.log(this.blocks);
    // this.blocks.forEach((block) => {
    //     // if(block.j > 0) return
    //
    //
    //     const finalX = (block.j - this.fieldShift.j) * this.cellSizes.w;
    //     // console.log(block.j);
    //     // console.log(block.x);
    //     // console.log(block.x);
    //     if(block.x > finalX) {
    //         block.x -= (block.x - finalX) / 10;
    //     } else if (block.x < finalX) {
    //         block.x += block.x / 10;
    //     }
    //
    // });
    // }
}
