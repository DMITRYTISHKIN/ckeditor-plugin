import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import InfoBlockEditing from './info-block-editing';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

export default class InfoBlock extends (Plugin as any) {
  static get requires() {
		return [ InfoBlockEditing, Widget ];
  }

  static get pluginName() {
		return 'InfoBlock';
  }

  constructor(editor) {
    super(editor);
  }
}
