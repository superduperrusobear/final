export class BaseScene extends Phaser.Scene {
    constructor(key) {
        super({ key: key });
    }

    // Common methods that all scenes might use
    setupCamera() {
        const { width, height } = this.cameras.main;
        return { width, height };
    }

    // Other shared functionality
} 