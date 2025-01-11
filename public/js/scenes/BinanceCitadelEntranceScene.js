export class BinanceCitadelEntranceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BinanceCitadelEntranceScene' });
    }

    preload() {
        this.load.image('citadelBackground', 'assets/backgrounds/binance.jpg');
        this.load.image('citadelTitle', 'assets/ui/text/citaofbinance.png');
    }

    create() {
        const { width, height } = this.cameras.main;

        const background = this.add.image(width/2, height/2, 'citadelBackground');
        background.setDisplaySize(width, height);

        const title = this.add.image(width/2, 100, 'citadelTitle');
        title.setScale(0.8);

        const continueText = this.add.text(width/2, height - 100, 'PRESS SPACE TO ENTER', {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        });
        continueText.setOrigin(0.5);

        this.tweens.add({
            targets: continueText,
            scale: { from: 1, to: 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.input.keyboard.once('keydown-SPACE', () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('BinanceMonologueScene');
            });
        });
    }
} 