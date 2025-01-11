export class VitalikTransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VitalikTransitionScene' });
        this.dialogueLines = [
            "A pulsating core of boundless potential,\nforged from the dreams of decentralization.",
            "Its radiance inspires vision and fortitude.",
            "Etheric Aura: Enemies within a small radius take 5% additional damage,\nas the heart's ethereal energy destabilizes their defenses."
        ];
        this.currentLine = 0;
        this.charIndex = 0;
        this.dialogueText = null;
        this.isDialogueComplete = false;
    }

    preload() {
        // Load assets for the Vitalik transition
        this.load.image('background', './assets/backgrounds/ethent.png');
        this.load.image('ethericHeartTitle', './assets/ui/text/theehtericheart.png');
        this.load.image('ethericHeartImage', './assets/ui/text/ethheart.png');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add dark background
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 1);
        overlay.setOrigin(0);

        // Add item title at the top
        const titleImage = this.add.image(width/2, 100, 'ethericHeartTitle');
        titleImage.setScale(0.5);
        
        // Add item image below title
        const itemImage = this.add.image(width/2, height/2 - 50, 'ethericHeartImage');
        itemImage.setScale(0.4);

        // Initialize dialogue text
        this.dialogueText = this.add.text(width/2, height - 200, '', {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            color: '#7fdbff',
            align: 'center',
            lineSpacing: 20,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add continue text with pulsing effect
        const continueText = this.add.text(width/2, height - 50, 'PRESS SPACE TO CONTINUE', {
            fontFamily: "'Press Start 2P'",
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        continueText.setAlpha(0);

        // Add pulsing effect to continue text
        this.tweens.add({
            targets: continueText,
            scale: { from: 1, to: 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Start the dialogue
        this.startDialogue();

        // Add space key handler for both advancing text and scene transition
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.isDialogueComplete) {
                this.cameras.main.fade(1000, 0, 0, 0);
                this.time.delayedCall(1000, () => {
                    this.scene.start('BinanceCitadelEntranceScene');
                });
            } else {
                this.advanceDialogue();
            }
        });

        // Show continue text after a delay
        this.time.delayedCall(1000, () => {
            this.tweens.add({
                targets: continueText,
                alpha: 1,
                duration: 500
            });
        });
    }

    startDialogue() {
        this.currentLine = 0;
        this.charIndex = 0;
        this.isDialogueComplete = false;
        this.typewriteText();
    }

    typewriteText() {
        if (this.currentLine >= this.dialogueLines.length) {
            this.isDialogueComplete = true;
            return;
        }

        const currentDialogue = this.dialogueLines[this.currentLine];
        if (this.charIndex < currentDialogue.length) {
            this.dialogueText.setText(currentDialogue.substring(0, this.charIndex + 1));
            this.charIndex++;
            this.time.delayedCall(30, () => this.typewriteText());
        }
    }

    advanceDialogue() {
        const currentDialogue = this.dialogueLines[this.currentLine];
        if (this.charIndex < currentDialogue.length) {
            // If text is still typing, complete it instantly
            this.dialogueText.setText(currentDialogue);
            this.charIndex = currentDialogue.length;
        } else {
            // Move to next line
            this.currentLine++;
            this.charIndex = 0;
            if (this.currentLine < this.dialogueLines.length) {
                this.dialogueText.setText('');
                this.typewriteText();
            } else {
                this.isDialogueComplete = true;
            }
        }
    }
} 