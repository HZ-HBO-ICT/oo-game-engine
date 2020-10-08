/// <reference path="framework/GameItem.ts"/>

class Asteroid extends GameItem {

    public static readonly BIG_ASTEROIDS: string[] = [
        "PNG.Meteors.meteorBrown_big1",
        "PNG.Meteors.meteorBrown_big2",
        "PNG.Meteors.meteorBrown_big3",
        "PNG.Meteors.meteorBrown_big4",
    ];

    public static readonly MEDIUM_ASTEROIDS: string[] = [
        "PNG.Meteors.meteorBrown_med1",
        "PNG.Meteors.meteorBrown_med3",
    ];

    public static readonly SMALL_ASTEROIDS: string[] = [
        "PNG.Meteors.meteorBrown_small1",
        "PNG.Meteors.meteorBrown_small2",
    ];

    public static readonly TINY_ASTEROIDS: string[] = [
        "PNG.Meteors.meteorBrown_tiny1",
        "PNG.Meteors.meteorBrown_tiny2",
    ];

    public static readonly TYPE_BIG    = 3;
    public static readonly TYPE_MEDIUM = 2;
    public static readonly TYPE_SMALL  = 1;
    public static readonly TYPE_TINY   = 0;

    private readonly type: number;

    private static readonly MAX_SPEED = 1.3;

    public constructor(type: number, image:HTMLImageElement, position: Vector, 
        speed: Vector, angle: number, angularSpeed: number, 
        offscreenBehaviour = GameItem.OFFSCREEN_BEHAVIOUR_OVERFLOW) {
        super(image, position, speed, angle, angularSpeed, offscreenBehaviour);
        this.type = type;
    }

    public static buildRandomAsteroid(game: Game, type = Asteroid.TYPE_BIG) {
        const image = game.repo.getImage(Asteroid.getRandomImageNameForType(type));
        const position = new Vector(
            Game.randomNumber(0,game.canvas.width - image.width / 2),
            Game.randomNumber(0, game.canvas.height - image.height / 2)
        );
        const speed = new Vector(
            Game.randomNumber(-Asteroid.MAX_SPEED,Asteroid.MAX_SPEED),
            Game.randomNumber(-Asteroid.MAX_SPEED,Asteroid.MAX_SPEED)
        );
        const angle = Game.randomNumber(0, 2 * Math.PI);
        const angularSpeed = 0.0005 * Game.randomNumber(-100, 100);
        return new Asteroid(type, image, position, speed, angle, angularSpeed);
    }

    /**
     * Helper method that chooses a random image name out of all possible
     * asteroid types.
     */
    public static getRandomImageName() : string {
        return this.getRandomImageNameForType(Math.floor(Math.random() * 4))
    }

    /**
     * Helper method that chooses a random image from a specific asteroid type.
     * 
     * @param type 
     */
    public static getRandomImageNameForType(type: number) : string {
        switch(type) {
            case this.TYPE_BIG:
                return this.BIG_ASTEROIDS[
                    Math.floor(Math.random() * this.BIG_ASTEROIDS.length)];
            case this.TYPE_MEDIUM:
                return this.MEDIUM_ASTEROIDS[
                    Math.floor(Math.random() * this.MEDIUM_ASTEROIDS.length)];
            case this.TYPE_SMALL:
                return this.SMALL_ASTEROIDS[
                    Math.floor(Math.random() * this.SMALL_ASTEROIDS.length)];
            case this.TYPE_TINY:
                return this.TINY_ASTEROIDS[
                    Math.floor(Math.random() * this.TINY_ASTEROIDS.length)];
        }
        return "";
    }

    public explode(game: Game, shot: Shot) : Asteroid[] {
        this.die();
        let result: Asteroid[] = [];
        if (this.type > Asteroid.TYPE_TINY) {
            for(let i=0; i<4; i++)
                result.push(this.createChunck(i, game, shot));
        }
        //TODO create smaller asteroids and return them
        //FIXME how to get the repo for loading the images???
        return result;
    }

    private createChunck(index: number, game: Game, shot: Shot): Asteroid {
        let posX = this._position.x;
        let posY = this._position.y;
        let spdX = this._speed.x;
        let spdY = this._speed.y;
        switch(index) {
            case 0:
                posX+= this._image.width/2;
                spdX+= Game.randomNumber(0.1, Asteroid.MAX_SPEED)
                break;
            case 1:
                posY+= this._image.height/2;
                spdY+= Game.randomNumber(0.1, Asteroid.MAX_SPEED)
                break;
            case 2:
                posX-= this._image.width/2;
                spdX-= Game.randomNumber(0.1, Asteroid.MAX_SPEED)
                break;
            case 1:
                posY-= this._image.height/2;
                spdY-= Game.randomNumber(0.1, Asteroid.MAX_SPEED)
                break;
            }
        
        return new Asteroid(
            this.type-1, 
            game.repo.getImage(Asteroid.getRandomImageNameForType(this.type-1)),
            new Vector(posX, posY), 
            new Vector(spdX, spdY).add(shot.speed.scale(0.1/this.type)),
            Game.randomNumber(0, 2 * Math.PI),
            0.0005 * Game.randomNumber(-100, 100)
        );
    }

}