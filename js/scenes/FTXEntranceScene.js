export class FTXEntranceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FTXEntranceScene' });
    }

    preload() {
        this.load.image('ftxBackground', './assets/backgrounds/ftxe.jpg');
        this.load.image('ftxTitle', './assets/ui/text/ftxruins.png');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add the entrance image with proper scaling
        const entrance = this.add.image(width/2, height/2, 'ftxBackground');
        const scaleX = width / entrance.width;
        const scaleY = height / entrance.height;
        const scale = Math.min(scaleX, scaleY);
        entrance.setScale(scale);

        // Add the title image
        const ruinsTitle = this.add.image(width/2, 80, 'ftxTitle');
        ruinsTitle.setOrigin(0.5);
        ruinsTitle.setScale(0.8);

        // Add the "Press SPACE to enter" text
        const enterText = this.add.text(width/2, height - 80, 'PRESS SPACE TO ENTER', {
            fontFamily: "'Press Start 2P'",
            fontSize: '32px',
            color: '#ffffff',
            align: 'center'
        });
        enterText.setOrigin(0.5);

        // Simple pulse animation for enter text
        this.tweens.add({
            targets: enterText,
            alpha: { from: 1, to: 0.5 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add space key handler
        this.input.keyboard.on('keydown-SPACE', () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('SBFBossFightScene');
            });
        });
    }
} 