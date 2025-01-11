export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
        this.score = 0;
    }

    create() {
        // Set up game world
        this.createUI();
        this.setupPlayer();
        this.setupCoins();
        this.setupControls();
    }

    createUI() {
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            font: '32px Arial',
            fill: '#14F195'
        });
    }

    setupPlayer() {
        // For now, create a simple player rectangle
        this.player = this.add.rectangle(400, 300, 32, 32, 0x9945FF);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
    }

    setupCoins() {
        // Create a group for coins
        this.coins = this.physics.add.group({
            key: 'coin',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        // For now, create simple coin circles
        this.coins.children.iterate((coin) => {
            coin.setCircle(8);
            coin.setFillStyle(0xFFD700);
            coin.y = Phaser.Math.Between(50, 550);
        });

        // Add collision between player and coins
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    }

    setupControls() {
        // Set up cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    collectCoin(player, coin) {
        coin.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        // Create new coin when collected
        if (this.coins.countActive(true) === 0) {
            this.coins.children.iterate((coin) => {
                coin.enableBody(true, coin.x, 0, true, true);
                coin.y = Phaser.Math.Between(50, 550);
            });
        }
    }

    update() {
        // Player movement
        const speed = 200;
        
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(speed);
        } else {
            this.player.body.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(speed);
        } else {
            this.player.body.setVelocityY(0);
        }
    }
} 