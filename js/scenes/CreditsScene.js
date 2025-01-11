export class CreditsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CreditsScene' });
    }

    preload() {
        this.load.image('creditsBackground', './assets/backgrounds/credits.png');
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Black background
        this.add.rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setDepth(0);

        // Credits text
        const credits = [
            'Congratulations!',
            '',
            'You have defeated all the crypto bosses',
            'and restored balance to the blockchain.',
            '',
            'A Soulsborne Experience',
            'Powered by Solana',
            '',
            'Thank you for playing!'
        ];

        // Create a container for all credit texts starting from the top of the screen
        const creditsContainer = this.add.container(width / 2, 0);

        let yPos = 100; // Start from top with some padding
        credits.forEach(line => {
            const textObject = this.add.text(0, yPos, line, {
                fontFamily: "'Press Start 2P'",
                fontSize: '32px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            creditsContainer.add(textObject);
            yPos += 70;
        });

        // Calculate total scroll duration based on content length
        const scrollDuration = credits.length * 1000; // 1 second per line

        // Scroll credits up from top to off screen
        this.tweens.add({
            targets: creditsContainer,
            y: -(creditsContainer.height + 200), // Scroll until all content is off screen
            duration: scrollDuration,
            ease: 'Linear',
            onComplete: () => {
                this.cameras.main.fade(1000, 0, 0, 0);
                this.time.delayedCall(1000, () => {
                    // Refresh the page to return to the very beginning
                    window.location.reload();
                });
            }
        });

        // Allow skipping with space
        this.input.keyboard.once('keydown-SPACE', () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                // Refresh the page to return to the very beginning
                window.location.reload();
            });
        });
    }
} 