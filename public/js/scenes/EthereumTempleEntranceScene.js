export class EthereumTempleEntranceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EthereumTempleEntranceScene' });
    }

    preload() {
        this.load.image('templeBackground', './assets/backgrounds/temple.png');
        this.load.image('templeTitle', './assets/ui/text/TEMPLE OF ETHEREUM.png');
    }

    create() {
        const { width, height } = this.cameras.main;

        const background = this.add.image(width/2, height/2, 'templeBackground');
        background.setDisplaySize(width, height);

        const title = this.add.image(width/2, 100, 'templeTitle');
        title.setScale(0.8);
    }
} 