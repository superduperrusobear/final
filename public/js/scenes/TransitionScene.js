export class TransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TransitionScene' });
        this.currentTextIndex = 0;
        this.isTransitioning = false;
    }

    preload() {
        this.load.image('ledgerText', './assets/ui/text/theledge.png');
        this.load.image('fraudulentText', './assets/ui/text/fradulentledgerr.png');
        this.load.image('transitionBg', 'assets/backgrounds/transition.png');
        this.load.image('transitionText', 'assets/ui/text/transition.png');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add black background
        const background = this.add.rectangle(0, 0, width, height, 0x000000);
        background.setOrigin(0);

        // Add title at the top
        const titleImage = this.add.image(width/2, 150, 'fraudulentText');
        titleImage.setScale(0.6);
        titleImage.setAlpha(0);

        // Add ledger image below title
        const ledgerImage = this.add.image(width/2, 300, 'ledgerText');
        ledgerImage.setScale(0.2);
        ledgerImage.setAlpha(0);

        // Create text content - split into dramatic lines
        this.textContent = [
            "A relic of failed empires...",
            "and shattered dreams.",
            "",
            "Its dark power whispers of the risks",
            "that once ruled the world of crypto.",
            "",
            "12% Increased Damage:",
            "Harness the volatile energy of the blockchain,",
            "amplifying your strikes with the fury",
            "of misplaced trust."
        ];

        // Add text with Metroidvania style
        this.dialogueText = this.add.text(width/2, 500, '', {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 20
        });
        this.dialogueText.setOrigin(0.5);
        this.dialogueText.setAlpha(0);

        // Add "Press SPACE" text
        this.continueText = this.add.text(width/2, height - 80, 'PRESS SPACE', {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        });
        this.continueText.setOrigin(0.5);
        this.continueText.setAlpha(0);

        // Fade in title and image first
        this.tweens.add({
            targets: [titleImage, ledgerImage],
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Show first text after title and image are visible
                this.showNextText();
                
                // Make continue text pulse
                this.tweens.add({
                    targets: this.continueText,
                    alpha: { from: 0, to: 1 },
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // Add space key handler
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.spaceKey.on('down', () => {
            if (this.isTransitioning) return;
            
            if (this.currentTextIndex < this.textContent.length) {
                this.showNextText();
            } else {
                this.isTransitioning = true;
                this.dialogueText.setAlpha(0);
                this.continueText.setAlpha(0);
                
                // Transition to next scene
                this.cameras.main.fade(1000, 0, 0, 0);
                this.time.delayedCall(1000, () => {
                    this.scene.start('EthereumEntranceScene');
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
} 