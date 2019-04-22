import InfoBlockStyleUI from './info-block-style.ui';
import InfoBlockStyleEditing from './info-block-style.editing';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class InfoBlockStyle extends (Plugin as any) {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ InfoBlockStyleEditing, InfoBlockStyleUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'InfoBlockStyle';
  }
  
  constructor(editor) {
    super(editor);
  }
}