import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';

const linkKeystroke = 'Ctrl+I';

export default class InfoBlockUI extends (Plugin as any) {
  static get pluginName() {
    return 'InfoBlockUI';
  }

  get _isFormInPanel() {
    return this._balloon.hasView(this.formView);
  }

  get _isUIInPanel() {
    return this._isFormInPanel
  }

  get _isUIVisible() {
    const visibleView = this._balloon.visibleView;
    return visibleView == this.formView;
  }

  constructor(editor) {
    super(editor);
  }

  init() {
    const editor = this.editor;

    editor.editing.view.addObserver(ClickObserver);

    this.formView = this._createFormView();

    this._createToolbarLinkButton();
  }

  destroy() {
    super.destroy();

    this.formView.destroy();
  }

  private _createToolbarLinkButton() {
    const editor = this.editor;
    const linkCommand = editor.commands.get('addHint');
    const t = editor.t;

    // Handle the `Ctrl+K` keystroke and show the panel.
    editor.keystrokes.set(linkKeystroke, (keyEvtData, cancel) => {
      // Prevent focusing the search bar in FF and opening new tab in Edge. #153, #154.
      cancel();

      if (linkCommand.isEnabled) {
        this._showUI();
      }
    });

    editor.ui.componentFactory.add('info-block', locale => {
      const button = new ButtonView(locale);

      button.isEnabled = true;
      button.label = t('Info block');
      button.class = 'info-block-icon'
      button.keystroke = linkKeystroke;
      button.tooltip = true;

      // Bind button to the command.
      button.bind('isOn', 'isEnabled').to(linkCommand, 'value', 'isEnabled');

      // Show the panel on button click.
      this.listenTo(button, 'execute', () => this._showUI());

      return button;
    });
  }

  _showUI() {
    const editor = this.editor;
    const linkCommand = editor.commands.get('addHint');

    if (!linkCommand.isEnabled) {
      return;
    }

  }

  public _hideUI() {
    if (!this._isUIInPanel) {
      return;
    }

    const editor = this.editor;

    this.stopListening(editor.ui, 'update');

    editor.editing.view.focus();

    this._removeFormView();
  }

  public findLinkElementAncestor(position) {
    return position.getAncestors().find(ancestor => this.isLinkElement(ancestor));
  }

  public isLinkElement(node) {
    return node.is('attributeElement') && !!node.getCustomProperty('addHint');
  }

}