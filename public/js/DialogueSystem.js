export class DialogueSystem {
    constructor(scene) {
        this.scene = scene;
        this.isTyping = false;
        this.textSpeed = 50;
    }

    startDialogue(text) {
        this.isTyping = true;
        this.currentText = text;
        this.displayedText = '';
        this.currentChar = 0;
    }

    isDialogueComplete() {
        return !this.isTyping;
    }

    skipTyping() {
        if (this.isTyping) {
            this.isTyping = false;
            this.displayedText = this.currentText;
        }
    }
} 