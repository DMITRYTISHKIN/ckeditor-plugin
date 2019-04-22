import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InfoBlockStyleCommand extends (Command as any) {
  private _defaultStyle: boolean;
  public styles: any;

	constructor( editor, styles ) {
		super( editor );

		this._defaultStyle = false;

		this.styles = styles.reduce( ( styles, style ) => {
			styles[ style.name ] = style;

			if ( style.isDefault ) {
				this._defaultStyle = style.name;
			}

			return styles;
		}, {} );
	}

	refresh() {
		const element = this.editor.model.document.selection.getSelectedElement();

		this.isEnabled = !!element && element.is( 'info-block' );

		if ( !element ) {
			this.value = false;
		} else if ( element.hasAttribute( 'info-block-style' ) ) {
			const attributeValue = element.getAttribute( 'info-block-style' );
			this.value = this.styles[ attributeValue ] ? attributeValue : false;
		} else {
			this.value = this._defaultStyle;
		}
	}

	execute( options ) {
		const styleName = options.value;

		const model = this.editor.model;
		const imageElement = model.document.selection.getSelectedElement();

		model.change( writer => {
			if ( this.styles[ styleName ].isDefault ) {
				writer.removeAttribute( 'info-block-style', imageElement );
			} else {
				writer.setAttribute( 'info-block-style', styleName, imageElement );
			}
		} );
	}
}