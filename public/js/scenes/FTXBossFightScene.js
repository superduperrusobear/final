export class FTXBossFightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FTXBossFightScene' });
    }

    preload() {
        // Load boss fight assets
        this.load.image('sbf', 'images/sbf.png');
        this.load.image('arena', 'images/ftx_arena.png');
        this.load.image('player', 'images/player.png');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add arena background
        const arena = this.add.image(width/2, height/2, 'arena');
        arena.setScale(Math.min(width / arena.width, height / arena.height));

        // Add player
        this.player = this.add.sprite(100, height - 100, 'player');
        
        // Add boss (SBF)
        this.boss = this.add.sprite(width - 100, height - 150, 'sbf');

        // Add basic controls
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Basic player movement
        if (this.cursors.left.isDown) {
            this.player.x -= 4;
        } else if (this.cursors.right.isDown) {
            this.player.x += 4;
        }
    }
} 