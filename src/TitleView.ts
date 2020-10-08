/// <reference path="framework/View.ts"/>

class TitleView extends View {

    private shouldGoToNextView: boolean = false;

    /**
     * Let the view listen to the users input.
     * 
     * @param input the input to listen to
     */
    public listen(input: Input) {
        super.listen(input);
        // See if the user wants to go to the next screen
        if (input.keyboard.isKeyDown(Input.KEY_SPACE)) {
            this.shouldGoToNextView = true;
        }
    }

    /**
     * @override
     */
    public adjust(game: Game) {
        if (this.shouldGoToNextView) {
            game.switchViewTo('start');
        }
    }

    /**
     * @override
     */
    public draw(ctx: CanvasRenderingContext2D) {
        //1. draw your score
        this.writeTextToCanvas(ctx, `${this.game.session.player} score is ${this.game.session.score}`, 
            80, this.center.x, this.center.y - 100);

        //2. draw all highscores
        this.writeTextToCanvas(ctx, "HIGHSCORES", 40, this.center.y, this.center.y);
        for (let i=0; i<this.game.session.highscores.length; i++) {
            this.center.y + 40;
            const text = `${i + 1}: ${this.game.session.highscores[i].playerName} - ${this.game.session.highscores[i].score}`;
            this.writeTextToCanvas(ctx, text, 20, this.center.x, this.center.y);
        }
    }

}