import Command from '@ckeditor/ckeditor5-core/src/command';
import { HINT_MODEL, findHintRange } from './hint.helper';

export class HintDeleteComand extends (Command as any) {
  public isEnabled;

  constructor(editor) {
    super(editor);
  }

  refresh() {
		this.isEnabled = this.editor.model.document.selection.hasAttribute(HINT_MODEL);
  }

  execute() {
    const model = this.editor.model;
    const selection = model.document.selection;

    model.change((writer) => {
      let ranges;
      if (selection.isCollapsed) {
        ranges = [findHintRange(selection.getFirstPosition(), selection.getAttribute(HINT_MODEL), model)]
      } else {
        ranges = selection.getRanges();
      }

      for (const range of ranges) {
        writer.removeAttribute(HINT_MODEL, range);
      }
    })
  }
}
