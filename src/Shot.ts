/// <reference path="framework/GameItem.ts"/>

class Shot extends GameItem {

    protected drawCollisionBounds(ctx: CanvasRenderingContext2D) {
        const y = -this._image.height / 2;
        const sp = this.shotPoint;
        ctx.moveTo(sp.x, sp.y);
        ctx.arc(sp.x, sp.y, 4, 0, 2 * Math.PI, false);
    }

    public get shotPoint() : Vector {
        const diff = Vector.fromSizeAndAngle(-this._image.height/2, this._angle).mirror_Y();
        return this._position.add(diff); 
    }

    public hits(item : GameItem) : boolean {
        const distance = Math.abs(item.position.subtract(this.shotPoint).size);
        return distance < item.collisionRadius;
    }

}