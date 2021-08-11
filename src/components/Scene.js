import { Container } from '../Container';
// import { Graphics } from '@pixi/graphics';
import { Rect } from '../Factory';
import { Field } from './Field';
import { Parser } from '../Parser';


export class Scene extends Container {

    constructor(...args) {
        super(...args);

        this.sizes = { w: 600, h: 600 };

        this.container = null;
        this.field     = null;

        const settings = {
            type     : 'cross', // 'sudoku'
            size     : { w: 5, h: 5 },
            cellSizes: { w: 30, h: 30 },
            words    : [
                {
                    id      : 1,
                    position: { i: 0, j: 0 },
                    across  : {
                        value : 'value',
                        ask   : 'description',
                        length: 5,
                    },
                    down    : {
                        value : 'va',
                        ask   : 'description',
                        length: 2,
                    },
                },
            ],

            matrix   : [
                // { i: 0, j: 2 , type: 'wall'},
                // { i: 0, j: 3 , type: 'wall'},
            ],
            cellTypes: {
                default: {
                    type     : 'default',
                    color    : 0xffffff,
                    line     : 1,
                    lineColor: 0x000000,
                },
                empty  : {
                    type: 'empty',

                },
                wall   : {
                    type : 'wall',
                    color: 0xff0000,
                },
            },
        };

        this.fieldData = Parser(settings);
        this.init();
    }

    init() {
        this.initBackground();
        this.initField();
    }

    initBackground() {
        this.container = this.addChild(Rect(
            { x: -100, w: 600, h: 600 },
            { color: 0x0CBCBCB },
        ));
    }

    initField() {
        this.field   = this.container.addChild(new Field(this.fieldData, { w: 600, h: 600 }));
        this.field.x = -100;
    }

    onResize() {

    }

    tick(delta) {
        if (this.field.tick) this.field.tick(delta);
    }
}
