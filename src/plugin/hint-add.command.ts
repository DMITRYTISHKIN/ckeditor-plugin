import Command from '@ckeditor/ckeditor5-core/src/command';
import { HINT_MODEL, findHintRange } from './hint.helper';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';

export default class HintAddCommand extends (Command as any) {
  public value;
  public isEnabled;

  constructor(editor) {
    super(editor);
  }

  refresh() {
    const model = this.editor.model;
    const doc = model.document;

    this.value = doc.selection.getAttribute();
		this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, HINT_MODEL);
  }

  execute(href) {
    const model = this.editor.model;
    const selection = model.document.selection;

    model.change((writer) => {
      if (selection.isCollapsed) {
        const position = selection.getFirstPosition();

        if (selection.hasAttribute(HINT_MODEL)) {
          const range = findHintRange(selection.getFirstPosition(), selection.getAttribute(HINT_MODEL), model);

          writer.setAttribute(HINT_MODEL, href, range);
          writer.setSelection(range);
        } else if (href !== '') {
          const attributes = toMap(selection.getAttributes());

          attributes.set(HINT_MODEL, href);
          const node = writer.createText(href, attributes);

          writer.insert(node, position);
          writer.setSelection(writer.createRangeOn(node));
        }
      } else {
        const ranges = model.schema.getValidRanges(selection.getRanges(), HINT_MODEL);

        for ( const range of ranges ) {
					writer.setAttribute(HINT_MODEL, href, range);
				}
      }
    })
  }
}
