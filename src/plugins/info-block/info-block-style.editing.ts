import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import first from '@ckeditor/ckeditor5-utils/src/first';
import InfoBlockStyleCommand from './info-block-style.command';

/**
 * The image style engine plugin. It sets the default configuration, creates converters and registers
 * {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand ImageStyleCommand}.
 *
 * @extends {module:core/plugin~Plugin}
 */
export default class InfoBlockStyleEditing extends (Plugin as any) {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'InfoBlockStyleEditing';
  }
  
  constructor(editor) {
    super(editor);
  }

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const data = editor.data;
		const editing = editor.editing;

		editor.config.define( 'info-block-edit.styles', [ 'full', 'side' ] );

		const styles = this._normalizeImageStyles( editor.config.get( 'info-block-edit.styles' ) );

		schema.extend( 'info-block-edit', { allowAttributes: 'info-block-style' } );

		const modelToViewConverter = this._modelToViewStyleAttribute( styles );
		editing.downcastDispatcher.on( 'attribute:info-block-style:info-block-edit', modelToViewConverter );
		data.downcastDispatcher.on( 'attribute:info-block-style:info-block-edit', modelToViewConverter );

		data.upcastDispatcher.on( 'element:figcaption', this._viewToModelStyleAttribute( styles ), { priority: 'low' } );

		editor.commands.add( 'info-block-style', new InfoBlockStyleCommand( editor, styles ) );
  }
  
  private _modelToViewStyleAttribute( styles ) {
    return ( evt, data, conversionApi ) => {
      if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
        return;
      }
  
      // Check if there is class name associated with given value.
      const newStyle = this._getStyleByName( data.attributeNewValue, styles );
      const oldStyle = this._getStyleByName( data.attributeOldValue, styles );
  
      const viewElement = conversionApi.mapper.toViewElement( data.item );
      const viewWriter = conversionApi.writer;
  
      if ( oldStyle ) {
        viewWriter.removeClass( oldStyle.className, viewElement );
      }
  
      if ( newStyle ) {
        viewWriter.addClass( newStyle.className, viewElement );
      }
    };
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

  private _getStyleByName( name, styles ) {
    for ( const style of styles ) {
      if ( style.name === name ) {
        return style;
      }
    }
  }

  private _viewToModelStyleAttribute( styles ) {
    debugger
    const filteredStyles = styles.filter( style => !style.isDefault );
  
    return ( evt, data, conversionApi ) => {
      if ( !data.modelRange ) {
        return;
      }
  
      const viewFigureElement = data.viewItem;
      const modelImageElement = first( data.modelRange.getItems() );
  
      if ( !conversionApi.schema.checkAttribute( modelImageElement, 'info-block-style' ) ) {
        return;
      }
  
      for ( const style of filteredStyles ) {
        if ( conversionApi.consumable.consume( viewFigureElement, { classes: style.className } ) ) {
          conversionApi.writer.setAttribute( 'info-block-style', style.name, modelImageElement );
        }
      }
    };
  }
  
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