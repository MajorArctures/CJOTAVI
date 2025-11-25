import Phaser from "phaser";

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super("PauseScene");
    }

   create() {
        const { width, height } = this.scale;

        // --- CARREGA OS SONS ---
        this.sfx = {
            menuclick: this.sound.add("menuclick"),
            menuhover: this.sound.add("menuhover"),
            menupause: this.sound.add("menupause")
        };

        // Toca som ao abrir o pause
        this.sfx.menupause.play();

        // Fundo escurecido com blur
        this.bg = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.5)
            .setDepth(0);

        // Caixa central
        const box = this.add.rectangle(width/2, height/2, 380, 260, 0x1a1a1a, 0.75)
            .setStrokeStyle(3, 0xffffff)
            .setDepth(1)
            .setScale(0.8);

        // Animação suave da caixa
        this.tweens.add({
            targets: box,
            scale: 1,
            duration: 500,
            ease: "Back.Out"
        });

        // Título
        const title = this.add.text(width/2, height/2 - 80, "Jogo Pausado", {
            fontSize: "36px",
            color: "#ffffff"
        }).setOrigin(0.5).setDepth(2);
        title.setShadow(0, 0, "#88b7ff", 16);

        // Botão: continuar
        const btnResume = this.add.text(width/2, height/2 + 10, "Continuar", {
            fontSize: "28px",
            color: "#ffeeaa"
        }).setOrigin(0.5).setDepth(2);

        btnResume.setShadow(0, 0, "#ffdd88", 12);
        btnResume.setInteractive({ useHandCursor: true });

        btnResume.on("pointerover", () => {
            this.sfx.menuhover.play();
        });

        btnResume.on("pointerdown", () => {
            this.sfx.menuclick.play();
            this.scene.stop();
            this.scene.resume("GameScene");
        });

        // Botão: voltar ao menu
        const btnMenu = this.add.text(width/2, height/2 + 70, "Menu Principal", {
            fontSize: "26px",
            color: "#ffffff"
        }).setOrigin(0.5).setDepth(2);

        btnMenu.setShadow(0, 0, "#ffffff", 8);
        btnMenu.setInteractive({ useHandCursor: true });

        btnMenu.on("pointerover", () => {
            this.sfx.menuhover.play();
        });

        btnMenu.on("pointerdown", () => {
            this.sfx.menuclick.play();
            this.scene.stop("GameScene");
            this.scene.start("MenuScene");
        });
    }

}
