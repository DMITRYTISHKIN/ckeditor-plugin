// import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Hint from './plugin/hint';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import ClassicEditor from './build/ckeditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

ClassicEditor
    .create(document.querySelector('#editor'), {
        plugins: [Hint, Paragraph, Essentials, Widget],
        toolbar: ['addHint']
    })
    .then(editor => {
        console.log('Editor was initialized kek', editor);
    })
    .catch(error => {
        console.error(error.stack);
    });


