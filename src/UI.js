export class UI {
    constructor() {

        this.counter = null;
        this.surface = null;

        this.spawn = null;
        this.speed = null;
    }

    init() {
        this.initHeader();
        this.initFooter();
    }

    initHeader() {
        this.counter = document.getElementById('counter');
        this.surface = document.getElementById('square');
    }

    initFooter() {
        const spawn = document.getElementById('spawn');
        this.spawn  = {
            decrease: spawn.children.namedItem('decrease'),
            increase: spawn.children.namedItem('increase'),
            value   : spawn.children.namedItem('value'),
        };

        const speed = document.getElementById('speed');
        this.speed  = {
            decrease: speed.children.namedItem('decrease'),
            increase: speed.children.namedItem('increase'),
            value   : speed.children.namedItem('value'),
        };
    }
}