import { EventEmitter } from '@pixi/utils';
import { Game } from './Game';


/**
 * @class
 * @classdesc Управление размерами игры.
 * LayoutManager.gameWidth, LayoutManager.gameHeight - текущий размер канваса
 * LayoutManager.orientation - ориентация устройства (LayoutManager.LANDSCAPE или LayoutManager.PORTRAIT)
 * Текущее окно игры получит вызов метода onResize каждый раз, когда LayoutManager производит манипуляции с канвасом
 * @hideconstructor
 */

const LayoutManager = {};

LayoutManager.width = 0;
LayoutManager.height = 0;

LayoutManager.watchId = null;
/**
 * Текущий scale приложения
 * @type {Number}
 * @static
 */
LayoutManager.scale = 1;

/**
 * Текущее соотношение сторон приложения
 * @type {Number}
 * @static
 */
LayoutManager.aspectRatio = 1;

/**
 * Текущая ширина канваса
 * @type {Number}
 * @static
 */
LayoutManager.gameWidth = 0;

/**
 * Текущая высота канваса
 * @type {Number}
 * @static
 */
LayoutManager.gameHeight = 0;

/**
 * Текущая ориентация устройства
 * @type {Number}
 * @static
 */
LayoutManager.orientation = 0;

/**
 * Левый край канваса
 * @type {Number}
 * @static
 */
LayoutManager.left = 0;

/**
 * Правый край канваса
 * @type {Number}
 * @static
 */
LayoutManager.right = 0;

/**
 * Верхний край канваса
 * @type {Number}
 * @static
 */
LayoutManager.top = 0;

/**
 * Нижний край канваса
 * @type {Number}
 * @static
 */
LayoutManager.bottom = 0;

/**
 * Ориентация ландшафтная
 * @type {Number}
 * @static
 */
LayoutManager.LANDSCAPE = 1;

/**
 * Ориентация портретная
 * @type {Number}
 * @static
 */
LayoutManager.PORTRAIT = 2;

LayoutManager.visibilityListenerAttached = false;

LayoutManager.observer = new EventEmitter();

// /**
//  * Принудительный скролл контента вниз, для скрытия адрессной строки
//  * @static
//  */
// LayoutManager.hideAddressBar = function() {
//     window.scrollTo(0, 1);
// };

/**
 * @ignore
 */
LayoutManager.getVisibilityProps = function() {
    let hidden, visibilityChange;

    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    }
    else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
    }
    else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    }
    else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    return {hidden: hidden, visibilityChange: visibilityChange};
};

/**
 * @ignore
 */
LayoutManager.handleVisibilityChange = function() {
    const visibilityProps = LayoutManager.getVisibilityProps();
    LayoutManager.observer.emit("visibilityChange", {hidden: document[visibilityProps.hidden]});
};

/**
 * Получение параметров видимости приложения
 * @static
 * @returns Boolean {Boolean}
 */
LayoutManager.isHidden = function() {
    const visibilityProps = LayoutManager.getVisibilityProps();
    return !!document[visibilityProps.hidden];
};

/**
 * Основной метод ресайза, вызывается автоматически при изменении размеров экрана, ротейте ну и просто так.
 * Эмитит событие "resize", изменяет внутренние переменные scale, aspectRatio, gameWidth, gameHeight, orientation
 * @static
 */
LayoutManager.fitLayout = function(container, w, h) {
    if(!LayoutManager.visibilityListenerAttached) {
        const visibilityProps = LayoutManager.getVisibilityProps();
        if (visibilityProps.visibilityChange) {
            document.addEventListener(visibilityProps.visibilityChange, LayoutManager.handleVisibilityChange);
            LayoutManager.visibilityListenerAttached = true;
        }
    }

    if (typeof w != "number" || typeof h != "number") {
        w = window.innerWidth;
        h = window.innerHeight;
    }

    if(LayoutManager.width === w && LayoutManager.height === h) return;

    // document.body.style.width = w + "px";
    // document.body.style.height = h + "px";

    LayoutManager.width = w;
    LayoutManager.height = h;
    LayoutManager.orientation = w > h ? LayoutManager.LANDSCAPE : LayoutManager.PORTRAIT;

    let gw, gh;

    if(LayoutManager.orientation === LayoutManager.LANDSCAPE) {
        gh = Game.size.w;
        gw = Math.floor(gh * (w / h));

        if(gw < Game.size.h) {
            gw = Game.size.h;
            gh = Math.floor(Game.size.h * (h / w));
        }
    }
    else {
        gh = Game.size.h;
        gw = Math.floor(gh * (w / h));

        if(gw < Game.size.w) {
            gw = Game.size.w;
            gh = Math.floor(Game.size.w * (h / w));
        }
    }

    Game.app.renderer.resize(gw, gh);

    Game.app.view.style.width = w + "px";
    Game.app.view.style.height = h + "px";

    LayoutManager.gameWidth = gw;
    LayoutManager.gameHeight = gh;

    LayoutManager.left = -gw/2;
    LayoutManager.right = gw/2;
    LayoutManager.top = -gh/2;
    LayoutManager.bottom = gh/2;

    LayoutManager.scale = Math.min(w/gw, h/gh);

    LayoutManager.aspectRatio = Math.max(gw/gh, gh/gw);

    Game.onResize();

    LayoutManager.observer.emit("resize", {width: LayoutManager.gameWidth, height: LayoutManager.gameHeight});

    // setTimeout(LayoutManager.hideAddressBar, 100);
};

LayoutManager.on = (event, cb, context) => {
    LayoutManager.observer.on(event, cb, context);
};

LayoutManager.once = (event, cb, context) => {
    LayoutManager.observer.once(event, cb, context);
};

LayoutManager.off = (event, cb, context) => {
    LayoutManager.observer.off(event, cb, context);
};

LayoutManager.watch = (game) => {
    if(LayoutManager.watchId) { clearInterval(LayoutManager.watchId) }
    LayoutManager.watchId = setInterval(LayoutManager.fitLayout, 100);
}


// /**
//  * Проверка соотношения строн устройства, для планшетов вернет true.
//  * Не iPad ли ты часом?
//  * @static
//  * @returns Boolean {Boolean}
//  */
// LayoutManager.isTablet = function() {
//     return LayoutManager.aspectRatio < 1.4;
// };
//
// /**
//  * Проверка соотношения строн устройства, для длинных устройств вернет true.
//  * Не iPhone X ли ты часом?
//  * @static
//  * @returns Boolean {Boolean}
//  */
// LayoutManager.isIphoneX = function() {
//     return LayoutManager.aspectRatio > 2;
// };

export { LayoutManager };
