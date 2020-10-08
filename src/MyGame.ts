/// <reference path="framework/Game.ts"/>

/**
 * This is the game main class.
 * 
 * Note: below the class definition you will find the main code that launches
 * the game.
 */
class MyGame extends Game {

    protected initResources(): any {
        return new ResourceConfig(
            [
                "PNG/UI/buttonBlue.png",
                "PNG/UI/playerLife1_blue.png",
                "PNG/playerShip1_blue.png",
                "PNG/Lasers/laserRed07.png",
                "PNG/Meteors/meteorBrown_big1.png",
                "PNG/Meteors/meteorBrown_big2.png",
                "PNG/Meteors/meteorBrown_big3.png",
                "PNG/Meteors/meteorBrown_big4.png",
                "PNG/Meteors/meteorBrown_med1.png",
                "PNG/Meteors/meteorBrown_med3.png",
                "PNG/Meteors/meteorBrown_small1.png",
                "PNG/Meteors/meteorBrown_small2.png",
                "PNG/Meteors/meteorBrown_tiny1.png",
                "PNG/Meteors/meteorBrown_tiny2.png",
            ],
            "./assets/images/SpaceShooterRedux"
        );
    }
    
    protected initGame() {
        this.session.player = "Player one";
        this.session.score = 0;
        this.session.level = 1;
        this.session.lives = 3;
        this.session.highscores = [
                {
                    playerName: 'Loek',
                    score: 40000
                },
                {
                    playerName: 'Daan',
                    score: 34000
                },
                {
                    playerName: 'Rimmert',
                    score: 200
                }
            ];
    }

    protected initViews(): {[key: string]: View} {
        return {
            'start' : new StartView(),
            'level' : new LevelView(),
            'title' : new TitleView(),
        };
    }

}

// DO NOT CHANGE THE CODE BELOW!
// Declare the game object as global variable for debugging purposes
let game = null;

// Add EventListener to load the game whenever the browser is ready
window.addEventListener('load', function () {
    game = new MyGame(<HTMLCanvasElement>document.getElementById('canvas'));
});
