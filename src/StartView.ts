/// <reference path="framework/View.ts"/>

class StartView extends View {

    private shouldGoToNextView: boolean = false;

    private buttonImage: HTMLImageElement;

    private asteroidAngle: number = 0;

    private asteroidImage: HTMLImageElement;

    /**
     * Let the view initialize itself within the game. This method is called
     * once before the first game cycle.
     * 
     * @param {HTMLCanvasElement} canvas
     * @param {ResourceRepository} repo
     */
    public init(game: Game) 
    {
        super.init(game);
        this.buttonImage = game.repo.getImage("PNG.UI.buttonBlue");
        this.asteroidImage = game.repo.getImage("PNG.Meteors.meteorBrown_big1");
    }

    public listen(input: Input) {
        super.listen(input);

        this.asteroidAngle = this.game.timing.viewFrames * Math.PI / 180;

        // See if user wants to go to the next screen
        if (input.keyboard.isKeyDown(Input.KEY_S)) {
            this.shouldGoToNextView = true;
        }
    }

    public adjust(game: Game) {
        if (this.shouldGoToNextView) {
            game.switchViewTo('level');
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        //1. add 'Asteroids' text
        this.writeTextToCanvas(ctx, "Asteroids", 140, this.center.x, 150);

        //2. add 'Press to play' text
        this.writeTextToCanvas(ctx, "PRESS PLAY OR HIT 'S' TO START", 40, this.center.x, this.center.y - 135);

        //3. add button with 'start' text
        this.drawImage(ctx, this.buttonImage, this.center.x, this.center.y + 220);
        this.writeTextToCanvas(ctx, "Play", 20, this.center.x, this.center.y + 229, 'center', 'black');

        //4. add Asteroid image
        this.drawImage(ctx, this.asteroidImage, this.center.x, this.center.y + 60, this.asteroidAngle);
    }

}
