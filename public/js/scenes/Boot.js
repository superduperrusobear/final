export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width/4, height/2 - 30, width/2, 50);

        // Loading text
        const loadingText = this.add.text(width/2, height/2 - 50, 'Loading...', {
            font: '20px monospace',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);

        // Progress bar events
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x9945FF, 1);
            progressBar.fillRect(width/4 + 10, height/2 - 20, (width/2 - 20) * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            this.scene.start('MainMenu');
        });

        // Load game assets
        this.load.setPath('assets');
        
        // Load your game assets here
        // this.load.image('player', 'player.png');
        // this.load.image('coin', 'coin.png');
        // Add more asset loading as needed
    }
} 