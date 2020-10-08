/// <reference path="framework/View.ts"/>

class LevelView extends View {

    private ship : Ship;
    private asteroids : Asteroid[] = [];

    private lifeImage: HTMLImageElement;

    private scoreX: number;
    
    /**
     * Let the view initialize itself within the game. This method is called
     * once before the first game cycle.
     * 
     * @param game the game object.
     */
    public init(game: Game) {
        super.init(game);

        this.lifeImage = game.repo.getImage("PNG.UI.playerLife1_blue");

        for (let i = 0; i < game.session.level; i++) {
            this.asteroids[i] = Asteroid.buildRandomAsteroid(game);
        }

        const image = game.repo.getImage("PNG.playerShip1_blue");
        const shotImage = game.repo.getImage("PNG.Lasers.laserRed07");
        const speed = new Vector();
        const position = new Vector(game.canvas.width / 2, game.canvas.height / 2);
        this.ship = new Ship(image, shotImage, position, speed, 0, 0);
    }

    /**
     * Let the view listen to the users input.
     * 
     * @param input the input to listen to
     */
    public listen(input: Input) {
        super.listen(input);
        // Listen to the keyboard to see if there is some player action
        if (input.keyboard.isKeyDown(Input.KEY_LEFT)){
            this.ship.decreaseAngularSpeed();
        }
        if (input.keyboard.isKeyDown(Input.KEY_RIGHT)){
            this.ship.increaseAngularSpeed();
        }
        if (input.keyboard.isKeyDown(Input.KEY_UP)) {
            this.ship.thrust();
        }
        if (input.keyboard.isKeyDown(Input.KEY_DOWN)) {
            this.ship.retroBoost();
        }
        if (input.keyboard.isKeyDown(Input.KEY_SPACE)) {
            this.ship.shoot();
        } else {
            this.ship.stopShooting();
        }
    }

    /**
     * Let the view move its GameItems about the canvas. This method should
     * only change the GameItems state to a new position. The draw() method
     * should be used to let each GameItem draw itself.
     * 
     * @param canvas the canvas to move about
     */
    public move(canvas: HTMLCanvasElement) {
        super.move(canvas);
        this.scoreX = canvas.width - 100;
        //3. draw random asteroids
        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].move(canvas);
        }

        this.ship.move(canvas);
    }

    /**
     * Let the game adjust its own state. This method can be used to let the
     * game load a new View, for instance after game over.
     * 
     * @param game the game object, to load a new View to
     */
    public adjust(game: Game) {
        // Check for collisions between asteroids and shots
        let shots = this.ship.shots;
        for (let i=0; i<shots.length; i++) {
            for (let j=0; j<this.asteroids.length; j++) {
                if (shots[i].hits(this.asteroids[j]) && !this.asteroids[j].isDead()) {
                    shots[i].die();
                    let newAsteroids = this.asteroids[j].explode(game, shots[i]);
                    newAsteroids.forEach((a) => {
                        this.asteroids.push(a);
                    });
                }
            }
        }

        // Remove dead shots from the game
        for (let i=0; i<shots.length; i++) {
            if (shots[i].isDead()) {
                shots.splice(i, 1);
            }
        }

        // Remove dead asteroids from the game
        for (let j=0; j<this.asteroids.length; j++) {
            if (this.asteroids[j].isDead()) {
                this.asteroids.splice(j, 1);
                this.game.session.score+=10;
            }
        }
        // See if the game is over
        if (this.ship.isDead()) {
            game.switchViewTo('title');
        }
    }

    /**
     * Let the View draw itself on the specified CanvasRenderingContext2D. This
     * should result in a new visible frame for the user.
     *  
     * @param ctx 
     */
    public draw(ctx: CanvasRenderingContext2D) {
        //3. draw random asteroids
        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].draw(ctx);
        }

        //4. draw player spaceship
        this.ship.draw(ctx);
        //1. load life images
        let x = 30;
        let y = 30;
        // Start a loop for each life in lives
        for (let life=0; life<this.game.session.lives; life++) {
            // Draw the image at the curren x and y coordinates
            this.drawImage(ctx, this.lifeImage, x, y);
            // Increase the x-coordinate for the next image to draw
            x += 50; 
        }

        //2. move and draw current score
        this.writeTextToCanvas(ctx, `Your score: ${this.game.session.score}`, 20, this.scoreX, 30, 'right');
    }

    public drawDebug(ctx: CanvasRenderingContext2D) {
        super.drawDebug(ctx);
        this.ship.drawDebug(ctx);
        //3. draw random asteroids
        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].drawDebug(ctx);
        }
    }

}