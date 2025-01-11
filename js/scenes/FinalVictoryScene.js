export class FinalVictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FinalVictoryScene' });
    }

    preload() {
        this.load.image('endBackground', './assets/backgrounds/endscreen.png');
        this.load.image('solanaLord', './assets/ui/text/solanalord.png');
    }

    create() {
        const { width, height } = this.cameras.main;
        const bgImage = this.add.image(width/2, height/2, 'endBackground');
        bgImage.setDisplaySize(width, height);
        
        const solanaText = this.add.image(width/2, height/2, 'solanaLord');
        solanaText.setScale(0.8);
        this.setupVictorySequence(solanaText);
    }

    setupVictorySequence(solanaText) {
        solanaText.setAlpha(0);
        this.tweens.add({
            targets: solanaText,
            alpha: { from: 0, to: 1 },
            duration: 1000,
            yoyo: true,
            hold: 2000,
            onComplete: () => {
                this.time.delayedCall(500, () => {
                    this.cameras.main.fade(1000, 0, 0, 0);
                    this.time.delayedCall(1000, () => {
                        this.scene.start('CreditsScene');
                    });
                });
            }
        });
    }
} 