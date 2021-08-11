export * from '@pixi/constants';
export * from '@pixi/math';
export * from '@pixi/runner';
export * from '@pixi/settings';
export * from '@pixi/ticker';
import * as utils from '@pixi/utils';
export { utils };
export * from '@pixi/core';
export * from '@pixi/sprite';
export * from '@pixi/app';
export * from '@pixi/graphics';
export * from '@pixi/text';
export * from '@pixi/interaction';

// Renderer plugins
import { Renderer } from '@pixi/core';
import { BatchRenderer } from '@pixi/core';
Renderer.registerPlugin('batch', BatchRenderer);
import { InteractionManager } from '@pixi/interaction';
Renderer.registerPlugin('interaction', InteractionManager);

// Application plugins
import { Application } from '@pixi/app';
import { TickerPlugin } from '@pixi/ticker';
Application.registerPlugin(TickerPlugin);

import { EventEmitter } from '@pixi/utils';

import { Graphics} from '@pixi/graphics';

import { GameScene } from './components/GameScene';
import { CONFIG } from '../CONFIG.js';
// import { UI } from './UI';


const Game = {};

Game.container     = null;
Game.size          = { w: CONFIG.size.w, h: CONFIG.size.h };
Game.app           = null;
Game.currentWindow = null;
Game.soundOn       = false;
Game.observer      = null;
Game.ui            = null;
Game.factory       = null;
Game.squareHelper  = null;

Game.init = container => {
    Game.container = container || document.body;
    const app = new Application({ backgroundColor: 0x1099bb, width: Game.size.w, height: Game.size.h });


    // const app = new PIXI.Application(Game.size.w, Game.size.h,
    //     { transparent: true, backgroundColor: 0xff0000, forceCanvas: true });
    Game.container.appendChild(app.view);
    // console.log('app');
    // console.dir(app);
    // console.log('==============');


    // app.view.addEventListener('mousedown', function () {
    //     Game.soundOn = true;
    //     Game.emit('interaction');
    // }, false);
    //
    // app.view.addEventListener('touchstart', function () {
    //     Game.soundOn = true;
    //     Game.emit('interaction');
    // }, false);

    Game.app = app;

    Game.observer = new EventEmitter();


    // Game.on('tick', (e)=> {
    //     console.log(e);
    // })


    // const ui = new UI();
    // ui.init();

    app.ticker.add(Game.tick);


    // const graphics = new Graphics();
    //
    // graphics.beginFill(0xDE3249);
    // graphics.drawRect(50, 50, 100, 100);
    // graphics.endFill();
    //
    // app.stage.addChild(graphics);


    // Game.showWindow(Factory.createComponent({ ID: 'GameScene' }));
    Game.showWindow(new GameScene());

    Game.onResize();

    window.addEventListener('keydown', (e)=> {
        console.log(e);
    }, false);

    // Game.currentWindow.initUI(ui);
    // Game.currentWindow.initSqrtHandler(Game.addSquareHelper);
};

Game.onResize = () => {
    if(Game.currentWindow) {
        Game.currentWindow.position.set(Game.app.renderer.width / 2, Game.app.renderer.height / 2);
        if(Game.currentWindow.onResize) Game.currentWindow.onResize();
    }

    // DomLayout.onResize(Game.app.stage);
};

Game.showWindow = (w) => {
    Game.currentWindow = w;

    Game.app.stage.addChildAt(w, 0);
};

// Game.addSquareHelper = () => {
//     let cleared = 0;
//     const { width, height } = Game.app.view;
//     const data = Game.app.view.getContext('2d')
//         .getImageData(0, 0, width, height).data;
//
//     const total = data.length / 4;
//
//     for (let i = 3; i < data.length; i += 4) {
//         if (data[i] === 0) {
//             cleared++;
//         }
//     }
//
//     return Math.sqrt(total - cleared);
// };

Game.emit = (event, a1, a2, a3, a4) => {
    Game.observer.emit(event, a1, a2, a3, a4);
    Game.observer.emit('gameEvent', { type: event, data: a1 });
};

Game.on = (event, fn, context) => {
    Game.observer.on(event, fn, context);
};

Game.once = (event, fn, context) => {
    Game.observer.once(event, fn, context);
};

Game.off = (event, fn, context) => {
    Game.observer.off(event, fn, context);
};

Game.tick = () => {
    // console.log(Game.app.ticker.elapsedMS);
    const delta = Game.app.ticker.elapsedMS;

    if (Game.currentWindow && Game.currentWindow.tick) {
        Game.currentWindow.tick(delta);
    }

    Game.emit('tick', delta);
};

export { Game };
