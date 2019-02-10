import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Image from '@ckeditor/ckeditor5-image/src/image';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Hint from './plugin/hint';


ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ Essentials, Paragraph, Bold, Italic, Code, Image, Widget, Hint ],
        toolbar: [ 'bold', 'italic' ],
        insertComponents: [{
        title: 'Компонент 1',
        value: 'Component-1'
        }]
    } )
    .then( editor => {
        console.log( 'Editor was initialized kek', editor );
    } )
    .catch( error => {
        console.error( error.stack );
    } );


