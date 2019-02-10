import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HintEditing from './hint-editing';

export default class Hint extends (Plugin as any) {
  static get requires() {
		return [ HintEditing ];
  }

  static get pluginName() {
		return 'Hint';
  }

  constructor(editor) {
    super(editor);
  }
}
