import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.displayProgressBar();

        // ---------------------------------------------------------------   
        // BACKGROUNDS
        this.load.image('background', 'assets/images/background.png');
        this.load.image('background2', 'assets/images/background2.png');
        this.load.image('aurora', 'assets/images/auroraboreal.png');

        // Inimigos
        this.load.spritesheet('enemies1', 'assets/images/enemies1.png', {
            frameWidth: 150,
            frameHeight: 150
        });
        this.load.spritesheet('enemies2', 'assets/images/enemies2.png', {
            frameWidth: 150,
            frameHeight: 150
        });
        this.load.spritesheet('enemies3', 'assets/images/enemies3.png', {
            frameWidth: 40,
            frameHeight: 35
        });

        // Explosão do inimigo
        this.load.spritesheet('enemyExplosion', 'assets/images/enemyExplosion.png', {
            frameWidth: 72,
            frameHeight: 72
        });
        // ---------------------------------------------------------------   
        // Tiros
        this.load.spritesheet('bullet', 'assets/images/bullet.png', {
            frameWidth: 72,
            frameHeight: 21
        });

        this.load.spritesheet('tripleBullet', 'assets/images/tripleBullet.png', {
            frameWidth: 72,
            frameHeight: 36
        });

        this.load.spritesheet('lunarRay', 'assets/images/lunarRay.png', {
            frameWidth: 72,
            frameHeight: 42
        });


        // ---------------------------------------------------------------   
        // HUD
        //this.load.image('heart', 'assets/images/heart.png');
        //this.load.image('hudFrame', 'assets/images/hudFrame.png'); // você precisará criar esse arquivo também

        // ---------------------------------------------------------------   
        // PLAYER 
        this.load.spritesheet("player", "assets/images/player.png", {
            frameWidth: 229,
            frameHeight: 257
        });

        // --------------------------------------------------------------
        // Sons
        this.load.audio("playershoot", "assets/sounds/playershoot.mp3");
        this.load.audio("playertripleshoot", "assets/sounds/playertripleshoot.wav");
        this.load.audio("playerlunarray", "assets/sounds/playerlunarray.wav");
        this.load.audio("playerdash", "assets/sounds/playerdash.wav");

        this.load.audio("enemyexplosion", "assets/sounds/enemyexplosion.wav");
        this.load.audio("playerhit", "assets/sounds/playerhit.flac");

        this.load.audio("upgrades", "assets/sounds/upgrades.wav");
        this.load.audio("phaseup", "assets/sounds/phaseup.wav");

        // Menu
        this.load.audio("menuhover", "assets/sounds/menuhover.mp3");
        this.load.audio("menuclick", "assets/sounds/menuclick.wav");
        this.load.audio("menupause", "assets/sounds/menupause.wav");

        // ---------------------------------------------------------------   
        // TRILHAS SONORAS
        //this.load.audio("music_menu", "assets/music/music_menu.mp3");
        this.load.audio("music_game", "assets/music/gamemusic.mp3");
        this.load.audio("music_cutscene", "assets/music/cutscene.mp3");

    }

    create() {
        this.scene.start('MenuScene');
    }


    displayProgressBar() {
        const { width, height } = this.cameras.main;

        const bg = this.add.graphics();
        bg.fillStyle(0x222222, 0.8);
        bg.fillRect(width / 4 - 2, height / 2 - 12, width / 2 + 4, 24);

        const bar = this.add.graphics();

        const text = this.add.text(
            width / 2,
            height / 2 - 30,
            'Carregando...',
            { fontSize: '20px', fill: '#fff' }
        ).setOrigin(0.5);

        this.load.on('progress', (value) => {
            bar.clear();
            bar.fillStyle(0xffffff, 1);
            bar.fillRect(width / 4, height / 2 - 10, (width / 2) * value, 20);
        });

        this.load.on('complete', () => {
            bar.destroy();
            text.destroy();
        });
    }
}
