import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';


export default class HintActionsView extends (View as any) {
  public focusTracker: FocusTracker;
  public keystrokes: KeystrokeHandler;
  public previewButtonView: ButtonView;

  public unlinkButtonView: ButtonView;
  public editButtonView: ButtonView;

  private _focusables: ViewCollection;
  private _focusCycler: FocusCycler;

  constructor(locale) {
    super(locale);
    const t = locale.t;

    this.focusTracker = new FocusTracker();
    this.keystrokes = new KeystrokeHandler();

    this.previewButtonView = this._createPreviewButton();

    this.unlinkButtonView = this._createButton( t( 'Delete hint' ), 'delete-hint-icon', 'deleteHint' );
    this.editButtonView = this._createButton( t( 'Edit hint' ), 'edit-hint-icon', 'edit' );
  
    this.set( 'title' );
    this._focusables = new ViewCollection();

    this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				focusPrevious: 'shift + tab',
				focusNext: 'tab'
			}
    } );
    
    this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-hint-actions',
				],

				tabindex: '-1'
			},

			children: [
				this.previewButtonView,
				this.editButtonView,
				this.unlinkButtonView
			]
		} );
  }

  render() {
		super.render();

		const childViews = [
			this.previewButtonView,
			this.editButtonView,
			this.unlinkButtonView
		];

		childViews.forEach( v => {
			this._focusables.add( v );
			this.focusTracker.add( v.element );
		} );

		this.keystrokes.listenTo( this.element );
  }
  
  focus() {
		this._focusCycler.focusFirst();
	}

  private _createButton(label, className, eventName): ButtonView {
    const button = new ButtonView(this.locale);

    button.set({
      label,
      class: className,
      tooltip: true
    });

    button.delegate('execute').to(this, eventName);

    return button;
  }

  private _createPreviewButton(): ButtonView {
    const button = new ButtonView( this.locale );
		const bind = this.bindTemplate;
    const t = this.t;
    
    button.set({
      withText: true,
      tooltip: t('Open link in new tab')
    });

    button.extendTemplate({
      attributes: {
        class: [
          'ck',
          'ck-hint-actions__Preview'
        ],
        title: bind.to('title', title => Boolean(title))
      }
    });

    button.bind('label').to(this, 'title', title => {
      debugger
      return title || t('This hint has no text');
    });

    button.bind('isEnabled').to(this, 'title', title => Boolean(title));

    button.template.tag = 'span';
    button.template.eventListeners = {};

    return button;
  }
}