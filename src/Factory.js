import { Graphics } from '@pixi/graphics';

const createGraphics = (options = {}) => {
    const {
              alpha = 1,
              angle = 0,
              color = 0xffffff,
              line = 0,
              lineColor = 0x000000,
              lineAlpha = 1,
          } = options;

    const graphics  = new Graphics();

    graphics.rotation = angle;
    graphics.lineStyle(line, lineColor, lineAlpha);
    graphics.beginFill(color, alpha);
    return graphics;
};

const Rect = ( { x = 0, y = 0, w = 1, h = 1}, options ) => {
    const graphics = createGraphics(options);
    graphics.drawRect(-w/2 + x, -h/2 + y, w, h);
    graphics.endFill();

    return graphics;
};

const Circle = ({ x = 0, y = 0,r = 1}, options) => {
    const graphics = createGraphics(options);
    graphics.drawCircle(-r/2 + x, -r/2 + y, r);
    graphics.endFill();

    return graphics;
};

const Poly = ( path, options ) => {
    const graphics = createGraphics(options);
    graphics.drawPolygon(path);
    graphics.endFill();

    return graphics;
};

const getTrianglePath = (size) => {
    return [-size, 0, size, size, size, -size, -size, 0];
};
const Triangle = ( size, options ) => { //todo add position fix
    const graphics = createGraphics(options);
    graphics.drawPolygon(getTrianglePath(size));
    graphics.endFill();

    return graphics;
};


export { Rect, Poly, Triangle, Circle };
