import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import LabeledInputView from '@ckeditor/ckeditor5-ui/src/labeledinput/labeledinputview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/boxed/boxededitoruiview';

import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import HintEditorView from './hint-editor.view';

export default class HintFormView extends (View as any) {
  public focusTracker: FocusTracker;
  public keystrokes: KeystrokeHandler;
  public saveButtonView: ButtonView;
  public cancelButtonView: ButtonView;
  public editableUiView: EditorUIView;
  public deleteHintButtonView: ButtonView;

  private _focusables: ViewCollection;
  private _focusCycler: FocusCycler;

  constructor(locale) {
    super(locale);

    const t = locale.t;

    this.focusTracker = new FocusTracker();
    this.keystrokes = new KeystrokeHandler();

    this.editableUiView = new HintEditorView(this.locale);
    // this.editableUiView.inputView.placeholder = 'Введите текст';

    this.saveButtonView = this._createButton(t('Save'), 'save-hint-icon');
    this.saveButtonView.type = 'submit';

    this.cancelButtonView = this._createButton(t('Cancel'), 'cancel-hint-icon', 'cancel');
    this.deleteHintButtonView = this._createButton(t('Delete'), 'delete-hint-icon', 'delete');

    this._focusables = new ViewCollection();

    this._focusCycler = new FocusCycler({
      focusables: this._focusables,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        focusPrevious: 'shift + tab',
        focusNext: 'tab'
      }
    });

    this.setTemplate({
      tag: 'form',
      attributes: {
        class: [
          'ck',
          'ck-hint-form',
        ],
        tabindex: '-1'
      },
      children: [
        this.editableUiView,
        this.deleteHintButtonView,
        {
          tag: 'div',
          attributes: {
            class: 'button-panel'
          },
          children: [
            this.saveButtonView,
            this.cancelButtonView,
          ]
        }
      ]
    });
  }

  render() {
    super.render();

    submitHandler({
      view: this
    });

    const childViews = [
      this.editableUiView,
      this.deleteHintButtonView,
      this.saveButtonView,
      this.cancelButtonView
    ];

    childViews.forEach(v => {
      this._focusables.add(v);
      this.focusTracker.add(v.element);
    });

    this.keystrokes.listenTo(this.element);
  }

  focus() {
    this._focusCycler.focusFirst();
  }

  private _createButton(label, className, eventName?): ButtonView {
    const button = new ButtonView(this.locale);

    button.set({
      label,
      tooltip: true
    });

    button.extendTemplate({
      attributes: {
        class: className
      }
    });

    if (eventName) {
      button.delegate('execute').to(this, eventName);
    }

    return button;
  }
}