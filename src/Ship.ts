/// <reference path="framework/GameItem.ts"/>

class Ship extends GameItem {

    public static readonly ANGULAR_SPEED_INCREMENT = 0.0004;
    public static readonly ANGULAR_SPEED_MAX       = 0.02;
    public static readonly MAX_SHOTS               = 10;
    public static readonly FWD_THRUST_INCREMENT    = 0.104;
    public static readonly RETRO_THRUST_INCREMENT  = 0.031;
    public static readonly FRAMES_BETWEEN_SHOTS    = 5;

    protected _shotImage: HTMLImageElement;


    private _shooting: number = 0;

    private _shots : Shot[] = [];

    public constructor(image:HTMLImageElement,shotImage:HTMLImageElement, 
        position: Vector, speed: Vector, 
        angle: number, angularSpeed: number, 
        offscreenBehaviour = GameItem.OFFSCREEN_BEHAVIOUR_OVERFLOW
    ) {
        super(image, position, speed, angle, angularSpeed, offscreenBehaviour);
        this._shotImage = shotImage;
    }

    public get shots() : Shot[] {
        return this._shots;
    }

    public increaseAngularSpeed() {
        this._angularSpeed += Ship.ANGULAR_SPEED_INCREMENT;
        if (this._angularSpeed > Ship.ANGULAR_SPEED_MAX) {
            this._angularSpeed = Ship.ANGULAR_SPEED_MAX;
        }
    }

    public decreaseAngularSpeed() {
        this._angularSpeed -= Ship.ANGULAR_SPEED_INCREMENT;
        if (this._angularSpeed < -Ship.ANGULAR_SPEED_MAX) {
            this._angularSpeed = -Ship.ANGULAR_SPEED_MAX;
        }
    }

    public thrust() {
        //construct a vector based on the current angle
        const thrustVector = Vector.fromSizeAndAngle(
            Ship.FWD_THRUST_INCREMENT, this._angle);
        //add the vector to the current speed
        this._speed = this._speed.add(thrustVector);
    }

    public retroBoost() {
        //construct a vector based on the current angle
        const thrustVector = Vector.fromSizeAndAngle(
            -Ship.RETRO_THRUST_INCREMENT, this._angle);
        //add the vector to the current speed
        this._speed = this._speed.add(thrustVector);
    }

    public shoot() {
        if (this._shooting>0) {
            this._shooting++;
            if (this._shooting > Ship.FRAMES_BETWEEN_SHOTS) this._shooting = 0;
        }
        if (!this._shooting && this.shots.length<Ship.MAX_SHOTS) {
            this._shooting = 1;
            //construct a vector based on the current angle
            const speed = Vector.fromSizeAndAngle(10, this._angle);
            const position = this._position.add(Vector.fromSizeAndAngle(-50, -this._angle));
            const shot = new Shot(this._shotImage, position, speed, this._angle, 0, GameItem.OFFSCREEN_BEHAVIOUR_DIE);
            this._shots.push(shot);
        }
    }

    public stopShooting() {
        this._shooting = 0;
    }

    public move(canvas: HTMLCanvasElement) {
        super.move(canvas);
        // 4. move and adjust the shots
        for (let i = 0; i < this._shots.length; i++) {
            this._shots[i].move(canvas);
            if (this._shots[i].isDead()) {
                this._shots.splice(i,1);
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.shots.length; i++) {
            this._shots[i].draw(ctx);
        }
        // The ship should be drawn over the shots
        super.draw(ctx);
    }
    
    public drawDebug(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.shots.length; i++) {
            this._shots[i].drawDebug(ctx);
        }
        // The ship should be drawn over the shots
        super.drawDebug(ctx);
    }
    
    
}