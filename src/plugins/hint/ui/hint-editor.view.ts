import View from '@ckeditor/ckeditor5-ui/src/view';
import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import ClassicEditor from '../../build/ckeditor';

export default class HintEditorView extends (View as any) {
  public editor;

  constructor(locale) {
    super(locale);

    this.setTemplate({
      tag: 'div',
      attributes: {
        class: 'hint-editor-container'
      },
      children: [{
        tag: 'div',
        attributes: {
          id: 'hint-editor'
        },
      }]
    });
  }

  render() {
    super.render();

    submitHandler({
      view: this
    });

    ClassicEditor
      .create(this.element.firstElementChild, {
        toolbar: ['bulletedList', 'numberedList']
      })
      .then(editor => {
        this.editor = editor;
      })
      .catch(error => {
        console.error(error.stack);
      });
  }

}