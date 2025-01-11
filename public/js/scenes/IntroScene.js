export class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
        this.dialogueLines = [
            { text: "Ah... the degenerate.", effect: 'fade' },
            { text: "The chain is in chaos.", effect: 'shake' },
            { text: "You must claim Solana's throne.", effect: 'glow' },
            { text: "Begin with Sam Bankman-Fried.", effect: 'dramatic' },
            { text: "Prove your worth... or fade into obscurity.", effect: 'fade' }
        ];
        this.currentLine = 0;
        this.isTyping = false;
        this.isTransitioning = false;
    }

    preload() {
        // Remove sword preload, keep others
        this.load.image('solanaThrone', './assets/backgrounds/solana_throne.png');
        this.load.image('solanaKnight', './assets/backgrounds/solana_knight.png');
        this.load.image('solanaObscurity', './assets/backgrounds/solana_obscurity.png');
    }

    create() {
        // Keep all existing setup code but remove sword-related lines
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;

        this.background = this.add.image(this.width/2, this.height/2, 'solanaThrone')
            .setOrigin(0.5)
            .setAlpha(0);

        const scaleX = this.width / this.background.width;
        const scaleY = this.height / this.background.height;
        const scale = Math.min(scaleX, scaleY);
        this.background.setScale(scale);

        this.dialogueBox = this.add.graphics()
            .fillStyle(0x000000, 0.7)
            .fillRect(0, this.height - 200, this.width, 200);

        this.dialogueBox.lineStyle(2, 0x9945FF, 1)
            .strokeRect(0, this.height - 200, this.width, 200);

        this.dialogueText = this.add.text(this.width/2, this.height - 120, '', {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Add skip prompt text
        this.skipPrompt = this.add.text(this.width/2, this.height - 60, 'PRESS SPACE TO CONTINUE', {
            fontFamily: "'Press Start 2P'",
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.startScene();

        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.currentLine < this.dialogueLines.length) {
                this.showNextLine();
            } else {
                this.cameras.main.fade(1000, 0, 0, 0);
                this.time.delayedCall(1000, () => {
                    this.scene.start('FTXEntranceScene');
                });
            }
        });
    }

    startScene() {
        // Fade in background
        this.tweens.add({
            targets: this.background,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                this.showNextLine();
                this.pulsePrompt();
            }
        });
    }

    startTypingNewLine(line) {
        this.dialogueText.setText('');
        this.dialogueText.setAlpha(1);
        
        let currentChar = 0;
        this.typeTimer = this.time.addEvent({
            delay: 40,
            callback: () => {
                currentChar++;
                this.dialogueText.setText(line.text.substring(0, currentChar));
                
                // When line is complete
                if (currentChar === line.text.length) {
                    this.isTyping = false;
                    
                    // Apply special effects based on the line
                    switch(line.effect) {
                        case 'shake':
                            this.cameras.main.shake(500, 0.005);
                            break;
                        case 'glow':
                            this.tweens.add({
                                targets: this.dialogueText,
                                alpha: { from: 0.7, to: 1 },
                                duration: 500,
                                yoyo: true,
                                repeat: 2
                            });
                            break;
                        case 'dramatic':
                            this.cameras.main.flash(500, 128, 0, 255);
                            break;
                        case 'fade':
                            this.tweens.add({
                                targets: this.dialogueText,
                                alpha: { from: 0.5, to: 1 },
                                duration: 1000,
                                ease: 'Power2'
                            });
                            break;
                    }
                    
                    // Trigger background changes
                    if (this.currentLine === 1) {
                        this.transitionBackground('solanaKnight');
                    } else if (this.currentLine === 3) {
                        this.transitionBackground('solanaObscurity');
                    }
                    
                    this.currentLine++;
                    
                    // Auto-progress with varying delays based on line importance
                    const delay = line.effect === 'dramatic' ? 3000 : 2000;
                    this.time.delayedCall(delay, () => {
                        if (this.currentLine < this.dialogueLines.length) {
                            this.showNextLine();
                        }
                    });
                }
            },
            repeat: line.text.length - 1
        });
    }

    transitionBackground(newImage) {
        this.tweens.add({
            targets: this.background,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                this.background.setTexture(newImage);
                this.tweens.add({
                    targets: this.background,
                    alpha: 1,
                    duration: 1000
                });
            }
        });
    }

    pulsePrompt() {
        // Add pulsing effect to skip prompt
        this.tweens.add({
            targets: this.skipPrompt,
            alpha: { from: 0, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    showNextLine() {
        if (this.currentLine >= this.dialogueLines.length || this.isTyping) return;
        
        const line = this.dialogueLines[this.currentLine];
        this.isTyping = true;
        this.startTypingNewLine(line);
    }
} 