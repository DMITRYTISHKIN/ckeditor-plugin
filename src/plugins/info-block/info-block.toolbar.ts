import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';
import { isWidget } from '@ckeditor/ckeditor5-widget/src/utils';

export default class InfoBlockToolbar extends (Plugin as any) {
  constructor(editor) {
    super(editor);
  }
	/**
	 * @inheritDoc
	 */
  static get requires() {
    return [WidgetToolbarRepository];
  }

	/**
	 * @inheritDoc
	 */
  static get pluginName() {
    return 'InfoBlockToolbar';
  }

	/**
	 * @inheritDoc
	 */
  afterInit() {
    const editor = this.editor;
    const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);

    widgetToolbarRepository.register('info-block', {
      items: ['info-block-style:full', 'info-block-style:side'],
      visibleWhen: this._getSelectedImageWidget.bind(this)
    });
  }

  private _getSelectedImageWidget(selection) {
    const viewElement = selection.getSelectedElement();
    debugger
    if (viewElement && this._isImageWidget(viewElement)) {
      return viewElement;
    }

    return null;
  }

  private _isImageWidget(viewElement) {
    debugger
    return !!viewElement.getCustomProperty('info-block') && isWidget(viewElement);
  }
}