// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    // key of the scene
    // the key will be used to start the scene by other scenes
    super("game");
  }

  preload() {
    this.load.image("paddle", "public/assets/paddle.png");
    this.load.image("ball", "public/assets/ball.png");
    this.load.image("brick", "public/assets/brick.png");
  }

  create() {
    this.gameWidth = this.sys.game.config.width;
    this.gameHeight = this.sys.game.config.height;

    // Pala
    this.paddle = this.physics.add.image(this.gameWidth / 2, this.gameHeight - 40, "paddle");
    this.paddle.setImmovable(true);
    this.paddle.setCollideWorldBounds(true);

    // Pelota
    this.ball = this.physics.add.image(this.gameWidth / 2, this.gameHeight - 70, "ball");
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(1, 1);
    this.ball.setVelocity(180, -220);
    this.ball.body.onWorldBounds = true;
    this.physics.world.setBoundsCollision(true, true, true, false);

    // Ladrillos
    this.bricks = this.physics.add.staticGroup();
    this._createBricksGrid({
      rows: 5,
      cols: 10,
      topOffset: 80,
      leftOffset: 60,
      hGap: 8,
      vGap: 8,
    });

    // Zona de suelo invisible para detectar caída
    this.ground = this.add.rectangle(
      this.gameWidth / 2,
      this.gameHeight + 10,
      this.gameWidth,
      20,
      0x000000,
      0
    );
    this.physics.add.existing(this.ground, true);

    // Colisión pelota-suelo
    this.physics.add.collider(this.ball, this.ground, () => {
      this._resetBall();
    });

    // Colisiones
    this.physics.add.collider(this.ball, this.paddle, this._bounceOffPaddle, null, this);
    this.physics.add.collider(this.ball, this.bricks, this._hitBrick, null, this);

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 450;

    if (this.cursors.left.isDown) {
      this.paddle.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.paddle.setVelocityX(speed);
    } else {
      this.paddle.setVelocityX(0);
    }
  }

  _createBricksGrid({ rows, cols, topOffset, leftOffset, hGap, vGap }) {
    const sample = this.add.image(0, 0, "brick").setVisible(false);
    const bw = sample.displayWidth;
    const bh = sample.displayHeight;
    sample.destroy();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = leftOffset + c * (bw + hGap) + bw / 2;
        const y = topOffset + r * (bh + vGap) + bh / 2;
        const brick = this.bricks.create(x, y, "brick");
        brick.refreshBody();
      }
    }
  }

  _bounceOffPaddle(ball, paddle) {
    const relative = (ball.x - paddle.x) / (paddle.displayWidth / 2);
    ball.setVelocityY(-Math.abs(ball.body.velocity.y));
    ball.setVelocityX(300 * Phaser.Math.Clamp(relative, -1, 1));
  }

  _hitBrick(ball, brick) {
    brick.disableBody(true, true);

    if (this.bricks.countActive(true) === 0) {
      this._resetBall();
      this._createBricksGrid({
        rows: 5,
        cols: 10,
        topOffset: 80,
        leftOffset: 60,
        hGap: 8,
        vGap: 8,
      });
    }
  }

  _resetBall() {
    this.ball.setPosition(this.gameWidth / 2, this.gameHeight - 70);
    const vx = Phaser.Math.Between(150, 220) * (Phaser.Math.Between(0, 1) ? 1 : -1);
    const vy = -Phaser.Math.Between(200, 260);
    this.ball.setVelocity(vx, vy);
  }
}
