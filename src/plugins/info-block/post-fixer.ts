export default function tableCellPostFixer( writer, model, mapper, view ) {
	let wasFixed = false;

	const elementsToCheck = getElementsToCheck( view );

	for ( const element of elementsToCheck ) {
		wasFixed = ensureProperElementName( element, mapper, writer ) || wasFixed;
	}

	// Selection in the view might not be updated to renamed elements. Happens mostly when other feature inserts paragraph to the table cell
	// (ie. when deleting table cell contents) and sets selection to it while table-post fixer changes view <p> to <span> element.
	// The view.selection would have outdated nodes.
	if ( wasFixed ) {
		updateRangesInViewSelection( model.document.selection, mapper, writer );
	}

	return wasFixed;
}

// Returns view elements changed in current view.change() block.
//
// **Note**: Currently it uses private property of the view: _renderer to get changed view elements to check.
//
// @param {module:engine/view/view~View} view
function getElementsToCheck( view ): any {
  let elementsWithChangedAttributes: any = [];
  if (Array.from( view._renderer.markedAttributes )[0]) {
    elementsWithChangedAttributes = (Array.from( view._renderer.markedAttributes )[0] as any)._children
      .filter( (el: any) => !!el.parent )
      .filter( isSpanOrP )
      .filter( (el: any) => isTdOrTh( el.parent ) );
  }

	// const changedChildren: any = Array.from( view._renderer.markedChildren )
	// 	.filter( (el: any) => !!el.parent )
	// 	.filter( isTdOrTh )
	// 	.reduce( ( prev: any, element: any ) => {
	// 		const childrenToCheck = Array.from( element.getChildren() ).filter( isSpanOrP );

	// 		return [ ...prev, ...childrenToCheck ];
  //   }, [] );
    
  //   console.log([ ...elementsWithChangedAttributes, ...changedChildren ]);

	return [ ...elementsWithChangedAttributes ];
}

// This method checks if view element for model's <paragraph> was properly converter.
// Paragraph should be either
// - span: for single paragraph with no attributes.
// - p   : in other cases.
function ensureProperElementName( currentViewElement, mapper, writer ) {
	const modelParagraph = mapper.toModelElement( currentViewElement );
	const expectedViewElementName = getExpectedElementName( modelParagraph.parent, modelParagraph );

	if ( currentViewElement.name !== expectedViewElementName ) {
		// Unbind current view element as it should be cleared from mapper.
		mapper.unbindViewElement( currentViewElement );

		const renamedViewElement = writer.rename( expectedViewElementName, currentViewElement );

		// Bind paragraph inside table cell to the renamed view element.
		mapper.bindElements( modelParagraph, renamedViewElement );

		return true;
	}

	return false;
}

// Expected view element name depends on model elements:
// - <paragraph> with any attribute set should be rendered as <p>
// - all <paragraphs> in <tableCell> that has more then one children should be rendered as <p>
// - an only <paragraph> child with no attributes should be rendered as <span>
//
// @param {module:engine/model/element~Element} tableCell
// @param {module:engine/model/element~Element} paragraph
// @returns {String}
function getExpectedElementName( tableCell, paragraph ) {
	const isOnlyChild = tableCell.childCount > 1;
	const hasAttributes = !![ ...paragraph.getAttributes() ].length;

	return ( isOnlyChild || hasAttributes ) ? 'p' : 'span';
}

// Method to filter out <span> and <p> elements.
//
// @param {module:engine/view/element~Element} element
function isSpanOrP( element ) {
	return element.is( 'p' ) || element.is( 'span' );
}

// Method to filter out <td> and <th> elements.
//
// @param {module:engine/view/element~Element} element
function isTdOrTh( element ) {
	return element.is( "figcaption" );
}

// Resets view selections based on model selection.
function updateRangesInViewSelection( selection, mapper, writer ) {
	const fixedRanges = Array.from( selection.getRanges() )
		.map( range => mapper.toViewRange( range ) );

	writer.setSelection( fixedRanges, { backward: selection.isBackward } );
}