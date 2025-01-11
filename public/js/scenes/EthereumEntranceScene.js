export class EthereumEntranceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EthereumEntranceScene' });
    }

    preload() {
        this.load.image('ethEntrance', 'assets/backgrounds/ethent.png');
        this.load.image('ethTitle', './assets/ui/text/tempofethereum.png');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add the entrance image
        const entrance = this.add.image(width/2, height/2, 'ethEntrance');
        entrance.setScale(1.2);

        // Add a dark overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.3);
        overlay.setOrigin(0);

        // Add the title at the top
        const templeTitle = this.add.image(width/2, 100, 'ethTitle');
        templeTitle.setOrigin(0.5);
        templeTitle.setScale(0.8);

        // Add the "Press SPACE to enter" text
        const enterText = this.add.text(width/2, height - 80, 'PRESS SPACE TO ENTER', {
            fontFamily: "'Press Start 2P'",
            fontSize: '38px',
            color: '#ffffff',
            align: 'center'
        });
        enterText.setOrigin(0.5);

        // Make the text pulse
        this.tweens.add({
            targets: enterText,
            alpha: { from: 1, to: 0.5 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add space key handler
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        spaceKey.on('down', () => {
            console.log('Space key pressed - transitioning to VitalikBossFightScene');
            // Disable the key to prevent multiple transitions
            spaceKey.enabled = false;
            
            // Start the transition
            this.cameras.main.fade(1000, 0, 0, 0);
            
            this.time.delayedCall(1000, () => {
                this.scene.start('VitalikBossFightScene');
            });
        });
    }
} 