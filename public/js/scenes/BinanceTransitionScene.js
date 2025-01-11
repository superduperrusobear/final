export class BinanceTransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BinanceTransitionScene' });
        this.currentTextIndex = 0;
        this.isTransitioning = false;
        this.textContent = [
            "A degenerate...",
            "toppling the King?",
            "Pathetic.",
            "This changes nothing.",
            "You're still nothing but a pawn...",
            "in a broken game."
        ];
    }

    preload() {
        this.load.image('binanceBackground', 'assets/backgrounds/binancea.png');
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Add background with proper scaling
        const background = this.add.image(width/2, height/2, 'binanceBackground');
        background.setDisplaySize(width, height);
        background.setDepth(0);
        
        // Add dark overlay for better text visibility
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
        overlay.setOrigin(0);
        overlay.setDepth(1);

        // Initialize dialogue text with higher depth
        this.dialogueText = this.add.text(width/2, height/2, '', {
            fontFamily: "'Press Start 2P'",
            fontSize: '32px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.dialogueText.setAlpha(1);
        this.dialogueText.setDepth(2);

        // Add continue text with pulsing effect
        this.continueText = this.add.text(width/2, height - 100, 'PRESS SPACE TO CONTINUE', {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.continueText.setDepth(2);
        this.continueText.setAlpha(0);

        // Add pulsing effect to continue text
        this.tweens.add({
            targets: this.continueText,
            scale: { from: 1, to: 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Show continue text after a delay
        this.time.delayedCall(1000, () => {
            this.tweens.add({
                targets: this.continueText,
                alpha: 1,
                duration: 500
            });
        });

        // Start with first text
        this.displayNewText();

        // Add space key handler
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.currentTextIndex < this.textContent.length) {
                this.showNextText();
            } else if (!this.isTransitioning) {
                this.isTransitioning = true;
                this.cameras.main.fade(1000, 0, 0, 0);
                this.time.delayedCall(1000, () => {
                    this.scene.start('FinalVictoryScene');
                });
            }
        });
    }

    showNextText() {
        if (this.currentTextIndex < this.textContent.length) {
            // Fade out current text if it exists
            if (this.dialogueText.text) {
                this.tweens.add({
                    targets: this.dialogueText,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        this.displayNewText();
                    }
                });
            } else {
                this.displayNewText();
            }
        }
    }

    displayNewText() {
        // Reset text
        this.dialogueText.setText('');
        this.dialogueText.setAlpha(1);
        
        if (this.currentTextIndex >= this.textContent.length) {
            this.isTransitioning = true;
            return;
        }
        
        let currentChar = 0;
        const text = this.textContent[this.currentTextIndex];
        
        // Create a timer for the typewriter effect
        const typeTimer = this.time.addEvent({
            delay: 40,
            callback: () => {
                if (currentChar <= text.length) {
                    this.dialogueText.setText(text.substring(0, currentChar));
                    currentChar++;
                }
            },
            repeat: text.length
        });
        
        this.currentTextIndex++;
    }
} 