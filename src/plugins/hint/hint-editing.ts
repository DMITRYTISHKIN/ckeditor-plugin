import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';
import HintAddCommand from './hint-add.command';
import { HINT_MODEL, HINT_VIEW, HINT_ATTR, HIGHLIGHT_CLASS, findHintRange } from './hint.helper';
import { HintDeleteComand } from './hint-delete.command';
import { downcastAttributeToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

export default class HintEditing extends (Plugin as any) {
  constructor(editor) {
    super(editor);
  }

  init() {
    const editor = this.editor;
    editor.model.schema.extend('$text', { allowAttributes: HINT_MODEL });

    editor.conversion.for('dataDowncast').add(
      downcastAttributeToElement({ model: HINT_MODEL, view: createHintElement })
    );

    editor.conversion.for('editingDowncast').add(
      downcastAttributeToElement({ model: HINT_MODEL, view: (title, writer) => createHintElement(title, writer) })
    );

    editor.conversion.for('upcast').add(
      upcastElementToAttribute({
        view: {
          name: HINT_VIEW,
          attributes: {
            title: true
          }
        },
        model: {
          key: HINT_MODEL,
          value: viewElement => viewElement.getAttribute(HINT_ATTR)
        }
      })
    );


    editor.commands.add('addHint', new HintAddCommand(editor));
    editor.commands.add('deleteHint', new HintDeleteComand(editor));

    bindTwoStepCaretToAttribute(editor.editing.view, editor.model, this, HINT_MODEL);
    this._setupHintHighlight();

    return null;
  }

  _setupHintHighlight() {
    const editor = this.editor;
    const view = editor.editing.view;
    const highlightedHints = new Set();

    view.document.registerPostFixer((writer) => {
      const selection = editor.model.document.selection;

      if (selection.hasAttribute(HINT_MODEL)) {
        const modelRange = findHintRange(selection.getFirstPosition(), selection.getAttribute(HINT_MODEL), editor.model);
        const viewRange = editor.editing.mapper.toViewRange(modelRange);

        for (const item of viewRange.getItems()) {
          if (item.is(HINT_VIEW)) {
            writer.addClass(HIGHLIGHT_CLASS, item);
            highlightedHints.add(item);
          }
        }
      }
    });

    editor.conversion.for('editingDowncast').add(dispatcher => {
      dispatcher.on('insert', removeHighlight, { priority: 'highest' });
      dispatcher.on('remove', removeHighlight, { priority: 'highest' });
      dispatcher.on('attribute', removeHighlight, { priority: 'highest' });
      dispatcher.on('selection', removeHighlight, { priority: 'highest' });

      function removeHighlight() {
        view.change((writer) => {
          highlightedHints.forEach((item) => {
            writer.removeClass(HIGHLIGHT_CLASS, item);
          });
          highlightedHints.clear();
        });
      }
    });
  }
}

function createHintElement(title, writer) {
  const hintElement = writer.createAttributeElement(HINT_VIEW, { title }, { priority: 5 });
  writer.setCustomProperty('addHint', true, hintElement);
  writer.addClass('ck-hint', hintElement);

  return hintElement;
}
