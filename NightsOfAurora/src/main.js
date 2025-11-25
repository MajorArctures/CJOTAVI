import Phaser from "phaser";

// Importa cenas
import PreloadScene from "./scenes/PreloadScene.js";
import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";
import PauseScene from "./scenes/PauseScene.js";
import GameOverScene from "./scenes/GameOverScene.js";
import WinScene from "./scenes/WinScene.js";
import CutsceneScene from "./scenes/Cutscene.js";


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#000000",
    parent: "game-container",

    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },

    scene: [
        PreloadScene,
        MenuScene,
        CutsceneScene,
        GameScene,
        PauseScene,    
        GameOverScene,
        WinScene
    ]
};

export default new Phaser.Game(config);
