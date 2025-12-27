// DialogManager.ts
import { CustomText } from './customtext';

export class DialogManager {
  static textUi: CustomText;
  static freeze_player = false;

  static init(textUi: CustomText) {
    this.textUi = textUi;
  }

  static say(text: string, freeze: boolean) {
    if (this.textUi) this.textUi.setDialogue(text);
      this.freeze_player = freeze;
  }
}
