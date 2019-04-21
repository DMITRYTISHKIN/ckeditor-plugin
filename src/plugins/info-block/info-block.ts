import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import InfoBlockEditing from './info-block-editing';

export default class InfoBlock extends (Plugin as any) {
  static get requires() {
		return [ InfoBlockEditing ];
  }

  static get pluginName() {
		return 'InfoBlock';
  }

  constructor(editor) {
    super(editor);
  }
}
