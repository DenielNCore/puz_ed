import { Sprite} from '@pixi/sprite';


export class Container extends Sprite {
    constructor() {
        super();

        this.interactive = true;
        this.anchor.set(0.5);

    }
}
