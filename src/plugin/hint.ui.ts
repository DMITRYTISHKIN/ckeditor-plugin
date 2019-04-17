import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import HintActionsView from './ui/hint-actions.view';
import HintFormView from './ui/hint-form.view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

const linkKeystroke = 'Ctrl+K';

export default class HintUI extends (Plugin as any) {
  public actionsView: HintActionsView;
  public formView: HintFormView;

  static get requires() {
    return [ContextualBalloon]
  }

  static get pluginName() {
    return 'HintUI';
  }

  get _isFormInPanel() {
    return this._balloon.hasView(this.formView);
  }

  get _areActionsInPanel() {
    return this._balloon.hasView(this.actionsView);
  }

  get _areActionsVisible() {
    return this._balloon.visibleView === this.actionsView;
  }

  get _isUIInPanel() {
    return this._isFormInPanel || this._areActionsInPanel;
  }

  get _isUIVisible() {
    const visibleView = this._balloon.visibleView;
    return visibleView == this.formView || this._areActionsVisible;
  }

  constructor(editor) {
    super(editor);
  }

  init() {
    const editor = this.editor;

    editor.editing.view.addObserver(ClickObserver);

    this.actionsView = this._createActionsView();
    this.formView = this._createFormView();

    this._balloon = editor.plugins.get(ContextualBalloon);

    this._createToolbarLinkButton();
    this._enableUserBalloonInteractions();
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

    editor.ui.componentFactory.add('addHint', locale => {
      const button = new ButtonView(locale);

      button.isEnabled = true;
      button.label = t('Hint');
      // button.icon = linkIcon;
      button.class = 'hint-icon'
      button.keystroke = linkKeystroke;
      button.tooltip = true;

      // Bind button to the command.
      button.bind('isOn', 'isEnabled').to(linkCommand, 'value', 'isEnabled');

      // Show the panel on button click.
      this.listenTo(button, 'execute', () => this._showUI());

      return button;
    });
  }

  _enableUserBalloonInteractions() {
    const viewDocument = this.editor.editing.view.document;

    this.listenTo(viewDocument, 'click', () => {
      const parentLink = this._getSelectedLinkElement();

      if (parentLink) {
        this._showUI();
      }
    });

    this.editor.keystrokes.set('Tab', (data, cancel) => {
      if (this._areActionsVisible && !this.actionsView.focusTracker.isFocused) {
        this.actionsView.focus();
        cancel();
      }
    }, {
        priority: 'high'
      });

    this.editor.keystrokes.set('Esc', (data, cancel) => {
      if (this._isUIVisible) {
        this._hideUI();
        cancel();
      }
    });

    // Close on click outside of balloon panel element.
    clickOutsideHandler({
      emitter: this.formView,
      activator: () => this._isUIVisible,
      contextElements: [this._balloon.view.element],
      callback: () => this._hideUI()
    });
  }

  private _createFormView(): HintFormView {
    const editor = this.editor;
    const formView = new HintFormView(editor.locale);
    const linkCommand = editor.commands.get('addHint');

    formView.hintInputView.bind('value').to(linkCommand, 'value');
    formView.editableUiView.render();

    // Form elements should be read-only when corresponding commands are disabled.
    formView.hintInputView.bind('isReadOnly').to(linkCommand, 'isEnabled', value => !value);
    formView.saveButtonView.bind('isEnabled').to(linkCommand);

    // Execute link command after clicking the "Save" button.
    this.listenTo(formView, 'submit', () => {
      editor.execute('addHint', formView.hintInputView.inputView.element.value);
      this._removeFormView();
    });

    // Hide the panel after clicking the "Cancel" button.
    this.listenTo(formView, 'cancel', () => {
      this._removeFormView();
    });

    // Close the panel on esc key press when the **form has focus**.
    formView.keystrokes.set('Esc', (data, cancel) => {
      this._removeFormView();
      cancel();
    });

    return formView;
  }

  private _removeFormView(): void {
    if (this._isFormInPanel) {
      // Blur the input element before removing it from DOM to prevent issues in some browsers.
      // See https://github.com/ckeditor/ckeditor5/issues/1501.
      this.formView.saveButtonView.focus();

      this._balloon.remove(this.formView);

      // Because the form has an input which has focus, the focus must be brought back
      // to the editor. Otherwise, it would be lost.
      this.editor.editing.view.focus();
    }
  }

  private _createActionsView(): HintActionsView {
    const editor = this.editor;
    const actionsView = new HintActionsView(editor.locale);
    const linkCommand = editor.commands.get('addHint');
    const unlinkCommand = editor.commands.get('deleteHint');

    debugger
    actionsView.bind('title').to(linkCommand, 'value');
    actionsView.editButtonView.bind('isEnabled').to(linkCommand);
    actionsView.unlinkButtonView.bind('isEnabled').to(unlinkCommand);

    // Execute unlink command after clicking on the "Edit" button.
    this.listenTo(actionsView, 'edit', () => {
      this._addFormView();
    });

    // Execute unlink command after clicking on the "Unlink" button.
    this.listenTo(actionsView, 'deleteHint', () => {
      editor.execute('deleteHint');
      this._hideUI();
    });

    // Close the panel on esc key press when the **actions have focus**.
    actionsView.keystrokes.set('Esc', (data, cancel) => {
      this._hideUI();
      cancel();
    });

    // Open the form view on Ctrl+K when the **actions have focus**..
    actionsView.keystrokes.set(linkKeystroke, (data, cancel) => {
      this._addFormView();
      cancel();
    });

    return actionsView;
  }

  _addFormView() {
    if (this._isFormInPanel) {
      return;
    }

    const editor = this.editor;
    const linkCommand = editor.commands.get('addHint');

    this._balloon.add({
      view: this.formView,
      position: this._getBalloonPositionData()
    });

    this.formView.hintInputView.select();

    this.formView.hintInputView.inputView.element.value = linkCommand.value || '';
  }

  _addActionsView() {
    if (this._areActionsInPanel) {
      return;
    }

    this._balloon.add({
      view: this.actionsView,
      position: this._getBalloonPositionData()
    });
  }

  _getBalloonPositionData() {
    const view = this.editor.editing.view;
    const viewDocument = view.document;
    const targetLink = this._getSelectedLinkElement();

    const target = targetLink ?
      // When selection is inside link element, then attach panel to this element.
      view.domConverter.mapViewToDom(targetLink) :
      // Otherwise attach panel to the selection.
      view.domConverter.viewRangeToDom(viewDocument.selection.getFirstRange());

    return { target };
  }

  _getSelectedLinkElement() {
    const view = this.editor.editing.view;
    const selection = view.document.selection;

    if (selection.isCollapsed) {
      return this.findLinkElementAncestor(selection.getFirstPosition());
    } else {
      // The range for fully selected link is usually anchored in adjacent text nodes.
      // Trim it to get closer to the actual link element.
      const range = selection.getFirstRange().getTrimmed();
      const startLink = this.findLinkElementAncestor(range.start);
      const endLink = this.findLinkElementAncestor(range.end);

      if (!startLink || startLink != endLink) {
        return null;
      }

      // Check if the link element is fully selected.
      if (view.createRangeIn(startLink).getTrimmed().isEqual(range)) {
        return startLink;
      } else {
        return null;
      }
    }
  }

  _showUI() {
    const editor = this.editor;
    const linkCommand = editor.commands.get('addHint');
    debugger

    if (!linkCommand.isEnabled) {
      return;
    }

    // When there's no link under the selection, go straight to the editing UI.
    if (!this._getSelectedLinkElement()) {
      this._addActionsView();
      this._addFormView();
    }
    // If theres a link under the selection...
    else {
      // Go to the editing UI if actions are already visible.
      if (this._areActionsVisible) {
        this._addFormView();
      }
      // Otherwise display just the actions UI.
      else {
        this._addActionsView();
      }
    }

    // Begin responding to ui#update once the UI is added.
    this._startUpdatingUI();
  }

  _startUpdatingUI() {
    const editor = this.editor;
    const viewDocument = editor.editing.view.document;

    let prevSelectedLink = this._getSelectedLinkElement();
    let prevSelectionParent = getSelectionParent();

    this.listenTo(editor.ui, 'update', () => {
      const selectedLink = this._getSelectedLinkElement();
      const selectionParent = getSelectionParent();

      if ((prevSelectedLink && !selectedLink) ||
        (!prevSelectedLink && selectionParent !== prevSelectionParent)) {
        this._hideUI();
      }

      else {
        this._balloon.updatePosition(this._getBalloonPositionData());
      }

      prevSelectedLink = selectedLink;
      prevSelectionParent = selectionParent;
    });

    function getSelectionParent() {
      return viewDocument.selection.focus.getAncestors()
        .reverse()
        .find(node => node.is('element'));
    }
  }

  public _hideUI() {
    if (!this._isUIInPanel) {
      return;
    }

    const editor = this.editor;

    this.stopListening(editor.ui, 'update');

    // Make sure the focus always gets back to the editable _before_ removing the focused form view.
    // Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
    editor.editing.view.focus();

    // Remove form first because it's on top of the stack.
    this._removeFormView();

    // Then remove the actions view because it's beneath the form.
    this._balloon.remove(this.actionsView);
  }

  public findLinkElementAncestor(position) {
    return position.getAncestors().find(ancestor => this.isLinkElement(ancestor));
  }

  public isLinkElement(node) {
    // console.log(node.getCustomProperty('title'));
    return node.is('attributeElement') && !!node.getCustomProperty('addHint');
  }

}