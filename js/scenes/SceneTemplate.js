export class SceneTemplate extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneTemplate' });
    }

    preload() {
        // Load scene assets
        this.load.image('background', '/images/your_background.png');
        this.load.image('title', '/images/text/your_title.png');
        this.load.image('item', '/images/your_item.png');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add dark background/overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
        overlay.setOrigin(0);

        // Add background if needed
        const background = this.add.image(width/2, height/2, 'background');
        background.setScale(1.2);

        // Add title at the top
        const title = this.add.image(width/2, 100, 'title');
        title.setOrigin(0.5);
        title.setScale(0.8);
        title.setAlpha(0);

        // Add main item/image
        const item = this.add.image(width/2, height/2 - 50, 'item');
        item.setOrigin(0.5);
        item.setScale(0.4);
        item.setAlpha(0);

        // Add description text
        const description = this.add.text(width/2, height - 200, 
            "Your description text here\nSpread across multiple lines if needed", {
            fontFamily: "'Press Start 2P'",
            fontSize: '32px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 15
        }).setOrigin(0.5);
        description.setAlpha(0);

        // Add ability/power text
        const abilityText = this.add.text(width/2, height - 100,
            "Ability Name: Your ability description here\nwith additional details if needed", {
            fontFamily: "'Press Start 2P'",
            fontSize: '28px',
            color: '#00ff00',
            align: 'center',
            lineSpacing: 15
        }).setOrigin(0.5);
        abilityText.setAlpha(0);

        // Fade in sequence
        this.tweens.add({
            targets: [title, item],
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: description,
                    alpha: 1,
                    duration: 1000,
                    ease: 'Power2',
                    onComplete: () => {
                        this.tweens.add({
                            targets: abilityText,
                            alpha: 1,
                            duration: 1000,
                            ease: 'Power2',
                            onComplete: () => {
                                // Add continue text
                                const continueText = this.add.text(width/2, height - 40, 
                                    "Press SPACE to continue", {
                                    fontFamily: "'Press Start 2P'",
                                    fontSize: '24px',
                                    color: '#ffffff'
                                }).setOrigin(0.5);
                                
                                // Add pulsing effect to continue text
                                this.tweens.add({
                                    targets: continueText,
                                    alpha: 0.5,
                                    duration: 1000,
                                    yoyo: true,
                                    repeat: -1
                                });
                            }
                        });
                    }
                });
            }
        });

        // Add space key handler for next scene
        this.input.keyboard.once('keydown-SPACE', () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('NextScene'); // Change this to your next scene
            });
        });
    }
} 