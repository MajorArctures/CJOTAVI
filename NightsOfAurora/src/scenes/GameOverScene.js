import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }

    create(data) {
        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.7)
            .setOrigin(0);

        // Texto principal
        this.add.text(width / 2, height / 2 - 80, "GAME OVER", {
            fontSize: "64px",
            color: "#ff4444",
            fontFamily: "Arial",
        }).setOrigin(0.5);

        if (data?.timeSurvived !== undefined) {
            this.add.text(width / 2, height / 2 - 10,
                `Você sobreviveu por ${data.timeSurvived}s`,
                {
                    fontSize: "22px",
                    color: "#ffffff",
                }
            ).setOrigin(0.5);
        }

        // Botão para reiniciar
        const retryText = this.add.text(width / 2, height / 2 + 70, "Tentar novamente", {
            fontSize: "28px",
            color: "#ffffff"
        }).setOrigin(0.5);

        retryText.setInteractive({ useHandCursor: true })
        .on("pointerover", () => retryText.setStyle({ color: "#ffff66" }))
        .on("pointerout", () => retryText.setStyle({ color: "#ffffff" }))
        .on("pointerdown", () => {
            this.scene.stop();
            const gameScene = this.scene.get("GameScene");
            gameScene.restartGame(); 
            this.scene.start("GameScene");
            
        });

        // Botão voltar ao menu
        const menuText = this.add.text(width / 2, height / 2 + 130, "Menu", {
            fontSize: "22px",
            color: "#cccccc"
        }).setOrigin(0.5);

        menuText.setInteractive({ useHandCursor: true })
            .on("pointerover", () => menuText.setStyle({ color: "#ffff66" }))
            .on("pointerout", () => menuText.setStyle({ color: "#cccccc" }))
            .on("pointerdown", () => {
                this.scene.start("MenuScene");
            });
    }

    
}
