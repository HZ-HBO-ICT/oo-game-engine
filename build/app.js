class GameItem {
    constructor(image, position, speed, angle, angularSpeed, offscreenBehaviour = GameItem.OFFSCREEN_BEHAVIOUR_OVERFLOW) {
        this._image = image;
        this._position = position;
        this._speed = speed;
        this._angle = angle;
        this._angularSpeed = angularSpeed;
        this._offscreenBehaviour = offscreenBehaviour;
    }
    get collisionRadius() {
        return this._image.height / 2;
    }
    get position() {
        return this._position;
    }
    get speed() {
        return this._speed;
    }
    move(canvas) {
        this._position = new Vector(this._position.x + this._speed.x, this._position.y - this._speed.y);
        switch (this._offscreenBehaviour) {
            case GameItem.OFFSCREEN_BEHAVIOUR_OVERFLOW:
                this.adjustOverflow(canvas.width, canvas.height);
                break;
            case GameItem.OFFSCREEN_BEHAVIOUR_BOUNCE:
                break;
            case GameItem.OFFSCREEN_BEHAVIOUR_DIE:
                this.adjustDie(canvas.width, canvas.height);
                break;
        }
        this._angle += this._angularSpeed;
    }
    adjustOverflow(maxX, maxY) {
        if (this._position.x > maxX) {
            this._position = new Vector(-this._image.width, this._position.y);
        }
        else if (this._position.x < -this._image.width) {
            this._position = new Vector(maxX, this._position.y);
        }
        if (this._position.y > maxY + this._image.height / 2) {
            this._position = new Vector(this._position.x, -this._image.height / 2);
        }
        else if (this._position.y < -this._image.height / 2) {
            this._position = new Vector(this._position.x, maxY);
        }
    }
    adjustDie(maxX, maxY) {
        if (this._position.x + this._image.width > maxX || this._position.x < 0 ||
            this._position.y + this._image.height / 2 > maxY ||
            this._position.y - this._image.height / 2 < 0) {
            this.die();
        }
    }
    die() {
        this._state = GameItem.STATE_DEAD;
    }
    isDead() {
        return this._state == GameItem.STATE_DEAD;
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this._position.x, this._position.y);
        ctx.rotate(this._angle);
        ctx.drawImage(this._image, -this._image.width / 2, -this._image.height / 2);
        ctx.restore();
    }
    drawDebug(ctx) {
        ctx.save();
        ctx.strokeStyle = '#ffffb3';
        ctx.beginPath();
        this.drawCenterInfo(ctx);
        this.drawCollisionBounds(ctx);
        ctx.stroke();
        ctx.restore();
    }
    drawCenterInfo(ctx) {
        ctx.moveTo(this._position.x - 50, this._position.y);
        ctx.lineTo(this._position.x + 50, this._position.y);
        ctx.moveTo(this._position.x, this._position.y - 50);
        ctx.lineTo(this._position.x, this._position.y + 50);
        const text = `(${this._position.x.toPrecision(3)},${this._position.y.toPrecision(3)})`;
        ctx.font = `10px courier`;
        ctx.textAlign = 'left';
        ctx.fillText(text, this._position.x + 10, this._position.y - 10);
    }
    drawCollisionBounds(ctx) {
        ctx.moveTo(this._position.x, this._position.y);
        ctx.arc(this._position.x, this._position.y, this._image.width / 2, 0, 2 * Math.PI, false);
    }
}
GameItem.OFFSCREEN_BEHAVIOUR_OVERFLOW = 0;
GameItem.OFFSCREEN_BEHAVIOUR_BOUNCE = 2;
GameItem.OFFSCREEN_BEHAVIOUR_DIE = 3;
GameItem.STATE_ALIVE = 0;
GameItem.STATE_DYING = 8;
GameItem.STATE_DEAD = 9;
class Asteroid extends GameItem {
    constructor(type, image, position, speed, angle, angularSpeed, offscreenBehaviour = GameItem.OFFSCREEN_BEHAVIOUR_OVERFLOW) {
        super(image, position, speed, angle, angularSpeed, offscreenBehaviour);
        this.type = type;
    }
    static buildRandomAsteroid(game, type = Asteroid.TYPE_BIG) {
        const image = game.repo.getImage(Asteroid.getRandomImageNameForType(type));
        const position = new Vector(Game.randomNumber(0, game.canvas.width - image.width / 2), Game.randomNumber(0, game.canvas.height - image.height / 2));
        const speed = new Vector(Game.randomNumber(-Asteroid.MAX_SPEED, Asteroid.MAX_SPEED), Game.randomNumber(-Asteroid.MAX_SPEED, Asteroid.MAX_SPEED));
        const angle = Game.randomNumber(0, 2 * Math.PI);
        const angularSpeed = 0.0005 * Game.randomNumber(-100, 100);
        return new Asteroid(type, image, position, speed, angle, angularSpeed);
    }
    static getRandomImageName() {
        return this.getRandomImageNameForType(Math.floor(Math.random() * 4));
    }
    static getRandomImageNameForType(type) {
        switch (type) {
            case this.TYPE_BIG:
                return this.BIG_ASTEROIDS[Math.floor(Math.random() * this.BIG_ASTEROIDS.length)];
            case this.TYPE_MEDIUM:
                return this.MEDIUM_ASTEROIDS[Math.floor(Math.random() * this.MEDIUM_ASTEROIDS.length)];
            case this.TYPE_SMALL:
                return this.SMALL_ASTEROIDS[Math.floor(Math.random() * this.SMALL_ASTEROIDS.length)];
            case this.TYPE_TINY:
                return this.TINY_ASTEROIDS[Math.floor(Math.random() * this.TINY_ASTEROIDS.length)];
        }
        return "";
    }
    explode(game, shot) {
        this.die();
        let result = [];
        if (this.type > Asteroid.TYPE_TINY) {
            for (let i = 0; i < 4; i++)
                result.push(this.createChunck(i, game, shot));
        }
        return result;
    }
    createChunck(index, game, shot) {
        let posX = this._position.x;
        let posY = this._position.y;
        let spdX = this._speed.x;
        let spdY = this._speed.y;
        switch (index) {
            case 0:
                posX += this._image.width / 2;
                spdX += Game.randomNumber(0.1, Asteroid.MAX_SPEED);
                break;
            case 1:
                posY += this._image.height / 2;
                spdY += Game.randomNumber(0.1, Asteroid.MAX_SPEED);
                break;
            case 2:
                posX -= this._image.width / 2;
                spdX -= Game.randomNumber(0.1, Asteroid.MAX_SPEED);
                break;
            case 1:
                posY -= this._image.height / 2;
                spdY -= Game.randomNumber(0.1, Asteroid.MAX_SPEED);
                break;
        }
        return new Asteroid(this.type - 1, game.repo.getImage(Asteroid.getRandomImageNameForType(this.type - 1)), new Vector(posX, posY), new Vector(spdX, spdY).add(shot.speed.scale(0.1 / this.type)), Game.randomNumber(0, 2 * Math.PI), 0.0005 * Game.randomNumber(-100, 100));
    }
}
Asteroid.BIG_ASTEROIDS = [
    "PNG.Meteors.meteorBrown_big1",
    "PNG.Meteors.meteorBrown_big2",
    "PNG.Meteors.meteorBrown_big3",
    "PNG.Meteors.meteorBrown_big4",
];
Asteroid.MEDIUM_ASTEROIDS = [
    "PNG.Meteors.meteorBrown_med1",
    "PNG.Meteors.meteorBrown_med3",
];
Asteroid.SMALL_ASTEROIDS = [
    "PNG.Meteors.meteorBrown_small1",
    "PNG.Meteors.meteorBrown_small2",
];
Asteroid.TINY_ASTEROIDS = [
    "PNG.Meteors.meteorBrown_tiny1",
    "PNG.Meteors.meteorBrown_tiny2",
];
Asteroid.TYPE_BIG = 3;
Asteroid.TYPE_MEDIUM = 2;
Asteroid.TYPE_SMALL = 1;
Asteroid.TYPE_TINY = 0;
Asteroid.MAX_SPEED = 1.3;
class View {
    constructor() {
        this.center = new Vector();
        this.size = new Vector();
        this.isDebugKeysDown = false;
    }
    init(game) {
        this.game = game;
    }
    listen(input) {
        if (input.keyboard.isKeyDown(Input.KEY_CTRL)
            && input.keyboard.isKeyDown(Input.KEY_ALT)
            && input.keyboard.isKeyDown(Input.KEY_D)) {
            if (!this.isDebugKeysDown) {
                this.game.session.debug = !this.game.session.debug;
                this.isDebugKeysDown = true;
                console.log("Debug is set to " + this.game.session.debug);
            }
        }
        else {
            this.isDebugKeysDown = false;
        }
    }
    move(canvas) {
        this.size = new Vector(canvas.width, canvas.height);
        this.center = this.size.scale(0.5);
    }
    adjust(game) { }
    prepareDraw(ctx) {
        ctx.clearRect(0, 0, this.size.x, this.size.y);
    }
    draw(ctx) {
    }
    drawDebug(ctx) {
        ctx.save();
        ctx.translate(this.size.x - 123, this.size.y - 17);
        ctx.fillStyle = 'white';
        const text = `${this.game.timing.fps.toFixed(1)}fps`;
        ctx.font = `12px courier`;
        ctx.textAlign = 'left';
        ctx.fillText(text, 0, 0);
        let x = this.size.x - 120;
        let y = this.size.y - 15;
        ctx.fillRect(0, 3, 102, 10);
        let green = 255 - Math.round(255 * this.game.timing.load);
        let red = 255 - green;
        ctx.fillStyle = `rgb(${red}, ${green}, 0)`;
        ctx.fillRect(1, 4, 100 * this.game.timing.load, 8);
        ctx.restore();
    }
    writeTextToCanvas(ctx, text, fontSize = 20, xCoordinate, yCoordinate, alignment = "center", color = "white") {
        ctx.font = `${fontSize}px Minecraft`;
        ctx.fillStyle = color;
        ctx.textAlign = alignment;
        ctx.fillText(text, xCoordinate, yCoordinate);
    }
    drawImage(ctx, image, xCoordinate, yCoordinate, angle = 0) {
        ctx.save();
        ctx.translate(xCoordinate, yCoordinate);
        ctx.rotate(angle);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
        ctx.restore();
    }
}
class LevelView extends View {
    constructor() {
        super(...arguments);
        this.asteroids = [];
    }
    init(game) {
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
    listen(input) {
        super.listen(input);
        if (input.keyboard.isKeyDown(Input.KEY_LEFT)) {
            this.ship.decreaseAngularSpeed();
        }
        if (input.keyboard.isKeyDown(Input.KEY_RIGHT)) {
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
        }
        else {
            this.ship.stopShooting();
        }
    }
    move(canvas) {
        super.move(canvas);
        this.scoreX = canvas.width - 100;
        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].move(canvas);
        }
        this.ship.move(canvas);
    }
    adjust(game) {
        let shots = this.ship.shots;
        for (let i = 0; i < shots.length; i++) {
            for (let j = 0; j < this.asteroids.length; j++) {
                if (shots[i].hits(this.asteroids[j]) && !this.asteroids[j].isDead()) {
                    shots[i].die();
                    let newAsteroids = this.asteroids[j].explode(game, shots[i]);
                    newAsteroids.forEach((a) => {
                        this.asteroids.push(a);
                    });
                }
            }
        }
        for (let i = 0; i < shots.length; i++) {
            if (shots[i].isDead()) {
                shots.splice(i, 1);
            }
        }
        for (let j = 0; j < this.asteroids.length; j++) {
            if (this.asteroids[j].isDead()) {
                this.asteroids.splice(j, 1);
                this.game.session.score += 10;
            }
        }
        if (this.ship.isDead()) {
            game.switchViewTo('title');
        }
    }
    draw(ctx) {
        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].draw(ctx);
        }
        this.ship.draw(ctx);
        let x = 30;
        let y = 30;
        for (let life = 0; life < this.game.session.lives; life++) {
            this.drawImage(ctx, this.lifeImage, x, y);
            x += 50;
        }
        this.writeTextToCanvas(ctx, `Your score: ${this.game.session.score}`, 20, this.scoreX, 30, 'right');
    }
    drawDebug(ctx) {
        super.drawDebug(ctx);
        this.ship.drawDebug(ctx);
        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].drawDebug(ctx);
        }
    }
}
class Game {
    constructor(canvasId) {
        this.input = new Input();
        this.session = { debug: false };
        this.timing = new Timing();
        this.animate = () => {
            this.timing.onFrameStart();
            if (this.currentView != null) {
                this.currentView.listen(this.input);
                this.currentView.move(this.canvas);
                this.currentView.prepareDraw(this.ctx);
                this.currentView.draw(this.ctx);
                if (this.session.debug) {
                    this.currentView.drawDebug(this.ctx);
                }
                this.currentView.adjust(this);
            }
            this.timing.onFrameEnd();
            requestAnimationFrame(this.animate);
        };
        this.canvas = canvasId;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext('2d');
        this.repo = new ResourceRepository(this.initResources());
        this.initGame();
        this.views = this.initViews();
        this.startAnimation();
        this.setCurrentView(new LoadView(Object.keys(this.views)[0]));
    }
    switchViewTo(viewName) {
        const newView = this.views[viewName];
        if (!newView) {
            throw new Error(`A view with the name ${viewName} does not exist.`);
        }
        this.setCurrentView(newView);
    }
    setCurrentView(view) {
        this.currentView = view;
        console.log("Setting view to " + view);
        this.currentView.init(this);
        this.timing.onViewSwitched();
    }
    startAnimation() {
        console.log('start animation');
        requestAnimationFrame(this.animate);
    }
    static randomInteger(min, max) {
        return Math.round(Game.randomNumber(min, max));
    }
    static randomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }
}
class MyGame extends Game {
    initResources() {
        return new ResourceConfig([
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
        ], "./assets/images/SpaceShooterRedux");
    }
    initGame() {
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
    initViews() {
        return {
            'start': new StartView(),
            'level': new LevelView(),
            'title': new TitleView(),
        };
    }
}
let game = null;
window.addEventListener('load', function () {
    game = new MyGame(document.getElementById('canvas'));
});
class Ship extends GameItem {
    constructor(image, shotImage, position, speed, angle, angularSpeed, offscreenBehaviour = GameItem.OFFSCREEN_BEHAVIOUR_OVERFLOW) {
        super(image, position, speed, angle, angularSpeed, offscreenBehaviour);
        this._shooting = 0;
        this._shots = [];
        this._shotImage = shotImage;
    }
    get shots() {
        return this._shots;
    }
    increaseAngularSpeed() {
        this._angularSpeed += Ship.ANGULAR_SPEED_INCREMENT;
        if (this._angularSpeed > Ship.ANGULAR_SPEED_MAX) {
            this._angularSpeed = Ship.ANGULAR_SPEED_MAX;
        }
    }
    decreaseAngularSpeed() {
        this._angularSpeed -= Ship.ANGULAR_SPEED_INCREMENT;
        if (this._angularSpeed < -Ship.ANGULAR_SPEED_MAX) {
            this._angularSpeed = -Ship.ANGULAR_SPEED_MAX;
        }
    }
    thrust() {
        const thrustVector = Vector.fromSizeAndAngle(Ship.FWD_THRUST_INCREMENT, this._angle);
        this._speed = this._speed.add(thrustVector);
    }
    retroBoost() {
        const thrustVector = Vector.fromSizeAndAngle(-Ship.RETRO_THRUST_INCREMENT, this._angle);
        this._speed = this._speed.add(thrustVector);
    }
    shoot() {
        if (this._shooting > 0) {
            this._shooting++;
            if (this._shooting > Ship.FRAMES_BETWEEN_SHOTS)
                this._shooting = 0;
        }
        if (!this._shooting && this.shots.length < Ship.MAX_SHOTS) {
            this._shooting = 1;
            const speed = Vector.fromSizeAndAngle(10, this._angle);
            const position = this._position.add(Vector.fromSizeAndAngle(-50, -this._angle));
            const shot = new Shot(this._shotImage, position, speed, this._angle, 0, GameItem.OFFSCREEN_BEHAVIOUR_DIE);
            this._shots.push(shot);
        }
    }
    stopShooting() {
        this._shooting = 0;
    }
    move(canvas) {
        super.move(canvas);
        for (let i = 0; i < this._shots.length; i++) {
            this._shots[i].move(canvas);
            if (this._shots[i].isDead()) {
                this._shots.splice(i, 1);
            }
        }
    }
    draw(ctx) {
        for (let i = 0; i < this.shots.length; i++) {
            this._shots[i].draw(ctx);
        }
        super.draw(ctx);
    }
    drawDebug(ctx) {
        for (let i = 0; i < this.shots.length; i++) {
            this._shots[i].drawDebug(ctx);
        }
        super.drawDebug(ctx);
    }
}
Ship.ANGULAR_SPEED_INCREMENT = 0.0004;
Ship.ANGULAR_SPEED_MAX = 0.02;
Ship.MAX_SHOTS = 10;
Ship.FWD_THRUST_INCREMENT = 0.104;
Ship.RETRO_THRUST_INCREMENT = 0.031;
Ship.FRAMES_BETWEEN_SHOTS = 5;
class Shot extends GameItem {
    drawCollisionBounds(ctx) {
        const y = -this._image.height / 2;
        const sp = this.shotPoint;
        ctx.moveTo(sp.x, sp.y);
        ctx.arc(sp.x, sp.y, 4, 0, 2 * Math.PI, false);
    }
    get shotPoint() {
        const diff = Vector.fromSizeAndAngle(-this._image.height / 2, this._angle).mirror_Y();
        return this._position.add(diff);
    }
    hits(item) {
        const distance = Math.abs(item.position.subtract(this.shotPoint).size);
        return distance < item.collisionRadius;
    }
}
class StartView extends View {
    constructor() {
        super(...arguments);
        this.shouldGoToNextView = false;
        this.asteroidAngle = 0;
    }
    init(game) {
        super.init(game);
        this.buttonImage = game.repo.getImage("PNG.UI.buttonBlue");
        this.asteroidImage = game.repo.getImage("PNG.Meteors.meteorBrown_big1");
    }
    listen(input) {
        super.listen(input);
        this.asteroidAngle = this.game.timing.viewFrames * Math.PI / 180;
        if (input.keyboard.isKeyDown(Input.KEY_S)) {
            this.shouldGoToNextView = true;
        }
    }
    adjust(game) {
        if (this.shouldGoToNextView) {
            game.switchViewTo('level');
        }
    }
    draw(ctx) {
        this.writeTextToCanvas(ctx, "Asteroids", 140, this.center.x, 150);
        this.writeTextToCanvas(ctx, "PRESS PLAY OR HIT 'S' TO START", 40, this.center.x, this.center.y - 135);
        this.drawImage(ctx, this.buttonImage, this.center.x, this.center.y + 220);
        this.writeTextToCanvas(ctx, "Play", 20, this.center.x, this.center.y + 229, 'center', 'black');
        this.drawImage(ctx, this.asteroidImage, this.center.x, this.center.y + 60, this.asteroidAngle);
    }
}
class TitleView extends View {
    constructor() {
        super(...arguments);
        this.shouldGoToNextView = false;
    }
    listen(input) {
        super.listen(input);
        if (input.keyboard.isKeyDown(Input.KEY_SPACE)) {
            this.shouldGoToNextView = true;
        }
    }
    adjust(game) {
        if (this.shouldGoToNextView) {
            game.switchViewTo('start');
        }
    }
    draw(ctx) {
        this.writeTextToCanvas(ctx, `${this.game.session.player} score is ${this.game.session.score}`, 80, this.center.x, this.center.y - 100);
        this.writeTextToCanvas(ctx, "HIGHSCORES", 40, this.center.y, this.center.y);
        for (let i = 0; i < this.game.session.highscores.length; i++) {
            this.center.y + 40;
            const text = `${i + 1}: ${this.game.session.highscores[i].playerName} - ${this.game.session.highscores[i].score}`;
            this.writeTextToCanvas(ctx, text, 20, this.center.x, this.center.y);
        }
    }
}
class LoadView extends View {
    constructor(nextView) {
        super();
        this.nextView = nextView;
    }
    listen(input) {
        super.listen(input);
    }
    adjust(game) {
        if (!game.repo.isLoading() &&
            game.timing.viewTime > LoadView.MINIMUM_FRAME_TIME) {
            game.switchViewTo(this.nextView);
        }
    }
    draw(ctx) {
        this.writeTextToCanvas(ctx, "Loading...", 80, this.center.x, this.center.y);
    }
}
LoadView.MINIMUM_FRAME_TIME = 1000;
class Input {
    constructor() {
        this.keyboard = new KeyListener();
        this.mouse = new MouseListener();
        this.window = new WindowListener();
    }
}
Input.MOUSE_NOTHING = 0;
Input.MOUSE_PRIMARY = 1;
Input.MOUSE_SECONDARY = 2;
Input.MOUSE_AUXILIARY = 4;
Input.MOUSE_FOURTH = 8;
Input.MOUSE_FIFTH = 16;
Input.KEY_ENTER = 13;
Input.KEY_SHIFT = 16;
Input.KEY_CTRL = 17;
Input.KEY_ALT = 18;
Input.KEY_ESC = 27;
Input.KEY_SPACE = 32;
Input.KEY_LEFT = 37;
Input.KEY_UP = 38;
Input.KEY_RIGHT = 39;
Input.KEY_DOWN = 40;
Input.KEY_DEL = 46;
Input.KEY_1 = 49;
Input.KEY_2 = 50;
Input.KEY_3 = 51;
Input.KEY_4 = 52;
Input.KEY_5 = 53;
Input.KEY_6 = 54;
Input.KEY_7 = 55;
Input.KEY_8 = 56;
Input.KEY_9 = 57;
Input.KEY_0 = 58;
Input.KEY_A = 65;
Input.KEY_B = 66;
Input.KEY_C = 67;
Input.KEY_D = 68;
Input.KEY_E = 69;
Input.KEY_F = 70;
Input.KEY_G = 71;
Input.KEY_H = 72;
Input.KEY_I = 73;
Input.KEY_J = 74;
Input.KEY_K = 75;
Input.KEY_L = 76;
Input.KEY_M = 77;
Input.KEY_N = 78;
Input.KEY_O = 79;
Input.KEY_P = 80;
Input.KEY_Q = 81;
Input.KEY_R = 82;
Input.KEY_S = 83;
Input.KEY_T = 84;
Input.KEY_U = 85;
Input.KEY_V = 86;
Input.KEY_W = 87;
Input.KEY_X = 88;
Input.KEY_Y = 89;
Input.KEY_Z = 90;
class KeyListener {
    constructor() {
        this.keyDown = (ev) => {
            this.keyCodeStates[ev.keyCode] = true;
        };
        this.keyUp = (ev) => {
            this.keyCodeStates[ev.keyCode] = false;
        };
        this.keyCodeStates = new Array();
        window.addEventListener("keydown", this.keyDown);
        window.addEventListener("keyup", this.keyUp);
    }
    isKeyDown(keyCode) {
        return this.keyCodeStates[keyCode] == true;
    }
}
class MouseListener {
    constructor() {
        this.mouseDown = (ev) => {
            this.buttonDown = ev.buttons;
        };
        this.mouseUp = (ev) => {
            this.buttonDown = 0;
        };
        this.mouseMove = (ev) => {
            this.position = new Vector(ev.clientX, ev.clientY);
        };
        this.mouseEnter = (ev) => {
            this.inWindow = true;
        };
        this.mouseLeave = (ev) => {
            this.inWindow = false;
        };
        this.position = new Vector();
        this.inWindow = true;
        window.addEventListener("mousedown", this.mouseDown);
        window.addEventListener("mouseup", this.mouseUp);
        window.addEventListener("mousemove", this.mouseMove);
        document.addEventListener("mouseenter", this.mouseEnter);
        document.addEventListener("mouseleave", this.mouseLeave);
    }
}
class WindowListener {
    constructor() {
        this.listen(0);
    }
    listen(interval) {
        var w = 0;
        var h = 0;
        if (!window.innerWidth) {
            if (!(document.documentElement.clientWidth == 0)) {
                w = document.documentElement.clientWidth;
                h = document.documentElement.clientHeight;
            }
            else {
                w = document.body.clientWidth;
                h = document.body.clientHeight;
            }
        }
        else {
            w = window.innerWidth;
            h = window.innerHeight;
        }
        this.size = new Vector(w, h);
    }
}
class ResourceConfig {
    constructor(images, prefix = "") {
        this.images = images;
        this.prefix = prefix;
    }
}
class ResourceRepository {
    constructor(config) {
        this.images = {};
        this.loadingAssets = new Array();
        this.prefix = config.prefix;
        config.images.forEach((name) => {
            this.startLoadingImage(name);
        });
    }
    isLoading() {
        return this.loadingAssets.length > 0;
    }
    getImage(key) {
        return this.images[key];
    }
    startLoadingImage(name) {
        let imageElement = new Image();
        imageElement.addEventListener("load", (event) => {
            const key = this.generateKeyFromSrc(imageElement.src);
            this.images[key] = imageElement;
            this.loadingAssets.splice(this.loadingAssets.indexOf(key), 1);
        });
        const src = this.generateURL(name);
        this.loadingAssets.push(this.generateKeyFromSrc(src));
        imageElement.src = src;
    }
    generateKeyFromSrc(src) {
        const start = this.prefix.substring(1);
        const index = src.indexOf(start) + start.length + 1;
        const key = src.substr(index, src.length - index - 4).split("/").join(".");
        return key;
    }
    generateURL(name) {
        return this.prefix + "/" + name;
    }
}
class Timing {
    constructor() {
        this.gameFrames = 0;
        this.viewFrames = 0;
        this.gameStart = performance.now();
        this.gameTime = 0;
        this.viewTime = 0;
        this.frameTime = 0;
        this.frameIdleTime = 0;
        this.fps = 60;
        this.load = 0;
    }
    get frameComputeTime() {
        return this.frameTime - this.frameIdleTime;
    }
    onViewSwitched() {
        this.viewFrames = 0;
        this.viewStart = performance.now();
    }
    onFrameStart() {
        this.gameFrames++;
        this.viewFrames++;
        const now = performance.now();
        this.frameIdleTime = now - this.frameEnd;
        this.gameTime = now - this.gameStart;
        this.viewTime = now - this.viewStart;
        this.frameTime = now - this.frameStart;
        this.frameStart = now;
        this.fps = Math.round(1000 / this.frameTime);
        this.load = this.frameComputeTime / this.frameTime;
    }
    onFrameEnd() {
        this.frameEnd = performance.now();
    }
}
class Vector {
    constructor(x = 0, y = 0) {
        this._size = null;
        this._angle = null;
        this.x = x;
        this.y = y;
    }
    static fromSizeAndAngle(size, angle) {
        let x = size * Math.sin(angle);
        let y = size * Math.cos(angle);
        return new Vector(x, y);
    }
    get size() {
        if (!this._size) {
            this._size = Math.sqrt(Math.pow(this.x, 2) +
                Math.pow(this.y, 2));
        }
        return this._size;
    }
    get angle() {
        if (!this._angle) {
            this._angle = Math.atan(this.y / this.x);
        }
        return this._angle;
    }
    add(input) {
        return new Vector(this.x + input.x, this.y + input.y);
    }
    subtract(input) {
        return new Vector(this.x - input.x, this.y - input.y);
    }
    scale(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }
    normalize() {
        return Vector.fromSizeAndAngle(1, this.angle);
    }
    mirror_X() {
        return new Vector(this.x, this.y * -1);
    }
    mirror_Y() {
        return new Vector(this.x * -1, this.y);
    }
    distance(input) {
        return this.subtract(input).size;
    }
}
//# sourceMappingURL=app.js.map