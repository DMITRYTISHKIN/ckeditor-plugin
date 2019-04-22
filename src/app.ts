import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
// import ClassicEditor from './build/ckeditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import InfoBlock from './plugins/info-block/info-block';
import InfoBlockStyle from './plugins/info-block/info-block-style';
import InfoBlockToolbar from './plugins/info-block/info-block.toolbar';

ClassicEditor
    .create(document.querySelector('#editor'), {
        plugins: [Paragraph, Essentials, Widget, InfoBlock, Bold, InfoBlockStyle],
        toolbar: ['bold']
    })
    .then(editor => {
        console.log('Editor was initialized kek', editor);
    })
    .catch(error => {
        console.error(error.stack);
    });


