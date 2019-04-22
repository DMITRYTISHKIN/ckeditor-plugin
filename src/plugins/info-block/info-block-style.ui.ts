import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

// import { normalizeImageStyles } from './utils';

// import '../../theme/imagestyle.css';

export default class InfoBlockStyleUI extends (Plugin as any) {
	static get pluginName() {
		return 'InfoBlockStyleUI';
  }
  
  constructor(editor) {
    super(editor);
  }

	get localizedDefaultStylesTitles() {
		const t = this.editor.t;

		return {
			'Full size image': t( 'Full size image' ),
			'Side image': t( 'Side image' )
		};
	}

	init() {
		const editor = this.editor;
		const configuredStyles = ['full', 'side'];

		const translatedStyles = translateStyles( this._normalizeImageStyles( configuredStyles ), this.localizedDefaultStylesTitles );

		for ( const style of translatedStyles ) {
			this._createButton( style );
		}
	}

	_createButton( style ) {
		const editor = this.editor;
    debugger
		const componentName = `info-block-style:${ style.name }`;

		editor.ui.componentFactory.add( componentName, locale => {
			const command = editor.commands.get( 'info-block-style' );
			const view = new ButtonView( locale );

			view.set( {
				label: style.title,
				icon: style.icon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );
			view.bind( 'isOn' ).to( command, 'value', value => value === style.name );

			this.listenTo( view, 'execute', () => editor.execute( 'info-block-style', { value: style.name } ) );

			return view;
		} );
  }
  
  private _normalizeImageStyles( configuredStyles = [] ) {
    return configuredStyles.map( this._normalizeStyle );
  }


  private _normalizeStyle( style ) {
    if ( typeof style == 'string' ) {
      const styleName = style;
  
      if ( defaultStyles[ styleName ] ) {
        style = Object.assign( {}, defaultStyles[ styleName ] );
      } else {
        style = {
          name: styleName
        };
      }
    } else if ( defaultStyles[ style.name ] ) {
      const defaultStyle = defaultStyles[ style.name ];
      const extendedStyle = Object.assign( {}, style );
  
      for ( const prop in defaultStyle ) {
        if ( !style.hasOwnProperty( prop ) ) {
          extendedStyle[ prop ] = defaultStyle[ prop ];
        }
      }
  
      style = extendedStyle;
    }
  
    // if ( typeof style.icon == 'string' && defaultIcons[ style.icon ] ) {
    //   style.icon = defaultIcons[ style.icon ];
    // }
  
    return style;
  }
}

function translateStyles( styles, titles ) {
	for ( const style of styles ) {
		if ( titles[ style.title ] ) {
			style.title = titles[ style.title ];
		}
	}

	return styles;
}

const defaultStyles = {
	full: {
		name: 'full',
		title: 'Full size image',
    isDefault: true,
    className: 'image-style-full'
	},

	side: {
		name: 'side',
		title: 'Side image',
		className: 'image-style-side'
	},
};