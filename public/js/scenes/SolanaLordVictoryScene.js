export class SolanaLordVictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SolanaLordVictoryScene' });
    }

    preload() {
        this.load.image('endscreen_bg', './assets/backgrounds/endscreen.png');
        this.load.image('solanalord_text', './assets/ui/text/solanalord.png');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Add background
        const background = this.add.image(width/2, height/2, 'endscreen_bg');
        background.setDisplaySize(width, height);

        // Add darkening overlay for better text visibility
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.3);
        overlay.setOrigin(0);

        // Add victory text with fade in
        const victoryText = this.add.image(width/2, height/2, 'solanalord_text');
        victoryText.setScale(0.8);
        victoryText.setAlpha(0);

        // Add continue text
        const continueText = this.add.text(width/2, height - 100, 'PRESS SPACE TO CONTINUE', {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        });
        continueText.setOrigin(0.5);
        continueText.setAlpha(0);

        // Fade in victory text
        this.tweens.add({
            targets: victoryText,
            alpha: 1,
            duration: 2000,
            ease: 'Power2'
        });

        // Add pulsing effect to continue text
        this.tweens.add({
            targets: continueText,
            alpha: { from: 0, to: 1 },
            duration: 1000,
            delay: 2000,
            yoyo: true,
            repeat: -1
        });

        // Add space key handler
        this.input.keyboard.once('keydown-SPACE', () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('CreditsScene');
            });
        });
    }
} 