import { IntroScene } from './scenes/IntroScene.js';
import { FTXEntranceScene } from './scenes/FTXEntranceScene.js';
import { SBFBossFightScene } from './scenes/SBFBossFightScene.js';
import { TransitionScene } from './scenes/TransitionScene.js';
import { EthereumEntranceScene } from './scenes/EthereumEntranceScene.js';
import { VitalikBossFightScene } from './scenes/VitalikBossFightScene.js';
import { VitalikTransitionScene } from './scenes/VitalikTransitionScene.js';
import { BinanceCitadelEntranceScene } from './scenes/BinanceCitadelEntranceScene.js';
import { BinanceMonologueScene } from './scenes/BinanceMonologueScene.js';
import { BinanceBossFightScene } from './scenes/BinanceBossFightScene.js';
import { BinanceTransitionScene } from './scenes/BinanceTransitionScene.js';
import { FinalVictoryScene } from './scenes/FinalVictoryScene.js';
import { CreditsScene } from './scenes/CreditsScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        IntroScene,
        FTXEntranceScene,
        SBFBossFightScene,
        TransitionScene,
        EthereumEntranceScene,
        VitalikBossFightScene,
        VitalikTransitionScene,
        BinanceCitadelEntranceScene,
        BinanceMonologueScene,
        BinanceBossFightScene,
        BinanceTransitionScene,
        FinalVictoryScene,
        CreditsScene
    ]
};

export default config; 