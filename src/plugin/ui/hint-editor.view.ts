import View from '@ckeditor/ckeditor5-ui/src/view';
import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

export default class HintEditorView extends (View as any) {
  constructor(locale) {
    super(locale);

    this.setTemplate({
      tag: 'div',
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

    debugger
    ClassicEditor
      .create(this.element.firstElementChild, {
          plugins: [Essentials, Bold],
          toolbar: ['bold'],
      })
      .then(editor => {
          console.log('Editor was initialized kek', editor);
      })
      .catch(error => {
          console.error(error.stack);
      });
  }

}