import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    create() {
        const { width, height } = this.scale;

        this.sfx = {
            menuclick: this.sound.add("menuclick"),
            menuhover: this.sound.add("menuhover")
        };

        // Background
        this.background = this.add
            .image(width / 2, height / 2, "background2")
            .setOrigin(0.5)
            .setDepth(-10);

        // Título
        this.add.text(width / 2, height / 2 - 120, "Nights of Aurora", {
            fontSize: "48px",
            fontFamily: "Arial",
            color: "#ffffff"
        }).setOrigin(0.5);

        // Subtítulo
        this.add.text(width / 2, height / 2 - 60, "Sobreviva até a aurora", {
            fontSize: "20px",
            color: "#cccccc"
        }).setOrigin(0.5);

        // Botão Jogar
        const startText = this.add.text(width / 2, height / 2, "Jogar", {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        startText.setInteractive({ useHandCursor: true })
            .on("pointerover", () => {
                this.sfx.menuhover.play(); 
            })
            .on("pointerdown", () => {
                this.sfx.menuclick.play(); 
                this.scene.start("CutsceneScene");
            });
        // Crédito
        this.add.text(width / 2, height - 40,
            "IFSP - Análise e Desenvolvimento de Sistemas - 5º Sem.- Tópicos Avançados",
            { fontSize: "16px", color: "#999999" }
        ).setOrigin(0.5);

    }
}
