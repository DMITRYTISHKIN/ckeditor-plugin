import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HintEditing from './hint-editing';
import HintUI from './hint.ui';

export default class Hint extends (Plugin as any) {
  static get requires() {
		return [ HintEditing, HintUI ];
  }

  static get pluginName() {
		return 'Hint';
  }

  constructor(editor) {
    super(editor);
  }
}
