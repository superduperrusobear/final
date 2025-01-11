export class BinanceMonologueScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BinanceMonologueScene' });
        this.currentTextIndex = 0;
        this.isTransitioning = false;
    }

    preload() {
        this.load.image('binance_arena', './assets/backgrounds/binancea.png');
    }

    create() {
        const { width, height } = this.cameras.main;
        const background = this.add.image(width/2, height/2, 'binance_arena');
        background.setDisplaySize(width, height);
        
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        overlay.setOrigin(0);
        
        this.setupDialogue();
        this.showNextText();  // Show first text immediately

        // Add space key handler
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.isTransitioning) return;

            if (this.currentTextIndex >= this.textContent.length) {
                this.isTransitioning = true;
                this.cameras.main.fade(1000, 0, 0, 0);
                this.time.delayedCall(1000, () => {
                    this.scene.start('BinanceBossFightScene');
                });
            } else {
                this.showNextText();
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
        // Set new text
        this.dialogueText.setText('');
        this.dialogueText.setAlpha(1);
        
        let currentChar = 0;
        const text = this.textContent[this.currentTextIndex];
        
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

    setupDialogue() {
        this.textContent = [
            "So, you've come, desperate degenerate,",
            "clinging to scraps of hope.",
            "Do you think you're different from",
            "those who fell before me?",
            "I am no mere rival.",
            "I've consumed their strengths,",
            "perfected their flaws.",
            "I am liquidity itself—",
            "the infinite flow,",
            "the unbreakable chain.",
            "Your tricks are nothing.",
            "You are nothing.",
            "Come, face true power and drown in",
            "the depths of an ocean that",
            "cannot be drained.",
            "The Citadel of Binance will endure,",
            "and you will not."
        ];
        
        this.dialogueText = this.add.text(80, this.cameras.main.height/2 - 100, '', {
            fontFamily: "'Press Start 2P'",
            fontSize: '28px',
            color: '#ffffff',
            align: 'left',
            lineSpacing: 20
        });
        this.dialogueText.setAlpha(0);

        // Add "Press SPACE" text with pulsing effect
        this.continueText = this.add.text(this.cameras.main.width/2, this.cameras.main.height - 80, 'PRESS SPACE', {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        });
        this.continueText.setOrigin(0.5);

        // Add pulsing effect to continue text
        this.tweens.add({
            targets: this.continueText,
            alpha: { from: 1, to: 0.5 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
} 