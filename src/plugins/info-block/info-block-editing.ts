import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { downcastElementToElement } from "@ckeditor/ckeditor5-engine/src/conversion/downcast-converters";
import { toWidget } from "@ckeditor/ckeditor5-widget/src/utils";
import { toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import { attachPlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';
import tableCellPostFixer from './post-fixer';

export default class InfoBlockEditing extends (Plugin as any) {
  constructor(editor) {
    super(editor);
  }

  init() {
    const editor = this.editor;
    const view = editor.editing.view;
    const schema = editor.model.schema;
    const t = editor.t;
    const conversion = editor.conversion;
    const data = editor.data;
    const editing = editor.editing;

    schema.register("info-block", {
      isObject: true,
      isBlock: true,
      allowWhere: "$block"
    });

    schema.register("info-block-edit", {
      allowIn: 'info-block',
      isLimit: true,
    });

    schema.extend('$block', { allowIn: 'info-block-edit' })

    conversion.for("dataDowncast").add(
      downcastElementToElement({
        model: "info-block",
        view: (modelElement, viewWriter) =>
          this._createImageViewElement(viewWriter)
      })
    );

    conversion.for("editingDowncast").add(
      downcastElementToElement({
        model: "info-block",
        view: (modelElement, viewWriter) =>
          this._toImageWidget(
            this._createImageViewElement(viewWriter),
            viewWriter,
            t("image widget")
          )
      })
    );
    conversion.for("upcast").add(this._upcastTable());



    const createCaptionForData = writer =>
      writer.createContainerElement("figcaption");
    data.downcastDispatcher.on(
      "insert:info-block-edit",
      this._captionModelToView(createCaptionForData, false, false)
    );

    const createCaptionForEditing = this._captionElementCreator(
      view,
      t("Enter image caption")
    );
    editing.downcastDispatcher.on(
      "insert:info-block-edit",
      this._captionModelToView(createCaptionForEditing, true, true)
    );

    conversion.for('upcast').add(
      this.upcastTableCell()
    );

    editing.view.document.registerPostFixer( writer => tableCellPostFixer( writer, editor.model, editing.mapper, editing.view ) );
    editor.model.document.registerPostFixer(writer => this._tableCellContentsPostFixer(writer, editor.model));


  }

  private upcastTableCell( ) {
    return dispatcher => {
      dispatcher.on('element:figcaption', ( evt, data, conversionApi ) => {
        debugger
        const viewTableCell = data.viewItem;
  
        if ( !conversionApi.consumable.test( viewTableCell, { name: true } ) ) {
          return;
        }
  
        const tableCell = conversionApi.writer.createElement( 'info-block-edit' );
  
        const splitResult = conversionApi.splitToAllowedParent( tableCell, data.modelCursor );
  
        if ( !splitResult ) {
          return;
        }
  
        conversionApi.writer.insert( tableCell, splitResult.position );
        conversionApi.consumable.consume( viewTableCell, { name: true } );
  
        const modelCursor = conversionApi.writer.createPositionAt( tableCell, 0 );
        conversionApi.convertChildren( viewTableCell, modelCursor );
        debugger
        if ( !tableCell.childCount ) {
          conversionApi.writer.insertElement( 'paragraph', modelCursor );
        }
  
        data.modelRange = conversionApi.writer.createRange(
          conversionApi.writer.createPositionBefore( tableCell ),
          conversionApi.writer.createPositionAfter( tableCell )
        );
  
        // Continue after inserted element.
        data.modelCursor = data.modelRange.end;
      } );
    };
  }

  private _tableCellContentsPostFixer(writer, model) {
    const changes = model.document.differ.getChanges();


    let wasFixed = false;

    for (const entry of changes) {
      if (entry.type == 'remove' && entry.position.parent.is('info-block-edit')) {
        wasFixed = this._fixTableCellContent(entry.position.parent, writer) || wasFixed;
      }

      if (entry.type == 'insert') {
        if (entry.name == 'info-block-edit') {
          wasFixed = this._fixTableCellContent(entry.position.nodeAfter, writer) || wasFixed;
        }
      }
    }

    return wasFixed;

  }

  private _fixTableCellContent(tableCell, writer) {
    debugger
    if (tableCell.childCount == 0) {
      writer.insertElement('paragraph', tableCell);

      return true;
    }

    const textNodes = Array.from(tableCell.getChildren()).filter((child: any) => child.is('text'));

    for (const child of textNodes) {
      writer.wrap(writer.createRangeOn(child), 'paragraph');
    }

    return !!textNodes.length;
  }

  private _toImageWidget(viewElement, writer, label) {
    writer.setCustomProperty("info-block", true, viewElement);

    return toWidget(viewElement, writer, { hasSelectionHandler: true });
  }

  private _captionModelToView(elementCreator, hide = true, isWidget) {
    return (evt, data, conversionApi) => {
      const captionElement = data.item;

      // Return if element shouldn't be present when empty.
      if (!captionElement.childCount && !hide) {
        return;
      }

      if (!conversionApi.consumable.consume(data.item, "insert")) {
        return;
      }

      const viewImage = conversionApi.mapper.toViewElement(
        data.range.start.parent
      );
      const viewCaption = elementCreator(conversionApi.writer);
      const viewWriter = conversionApi.writer;

      // Hide if empty.
      if (!captionElement.childCount) {
        viewWriter.addClass("info-block-empty", viewCaption);
      }

      this._insertViewCaptionAndBind(
        viewCaption,
        data.item,
        viewImage,
        conversionApi,
        isWidget
      );
    };
  }

  private _createImageViewElement(writer) {
    const figure = writer.createContainerElement("figure", {
      class: "info-block"
    });

    return figure;
  }

  private _insertViewCaptionAndBind(viewCaption, modelCaption, viewImage, conversionApi, isWidget) {
    const viewPosition = conversionApi.writer.createPositionAt(viewImage, 'end');

    // as widget
    const innerParagraph = modelCaption.getChild( 0 );
    const isSingleParagraph = modelCaption.childCount === 1 && innerParagraph.name === 'paragraph';
    conversionApi.writer.insert(viewPosition, viewCaption);

    if (isSingleParagraph) {
      const paragraphInsertPosition = conversionApi.writer.createPositionAt(viewCaption, 'end');
      conversionApi.consumable.consume( innerParagraph, 'insert' );

      if (isWidget) {
        const fakeParagraph = conversionApi.writer.createContainerElement( 'span' );

        conversionApi.mapper.bindElements( innerParagraph, fakeParagraph );
        conversionApi.writer.insert( paragraphInsertPosition, fakeParagraph );

        conversionApi.mapper.bindElements(modelCaption, viewCaption);
      } else {
        conversionApi.mapper.bindElements(modelCaption, viewCaption);
        conversionApi.mapper.bindElements( innerParagraph, viewCaption );
      }
    } else {
      conversionApi.mapper.bindElements(modelCaption, viewCaption);
    }
  
    
  }

  private _captionElementCreator(view, placeholderText) {
    return writer => {
      const editable = writer.createEditableElement("figcaption", { class: 'info-block-caption' });
      attachPlaceholder(
        view,
        editable,
        placeholderText
      );

      return toWidgetEditable(editable, writer);
    };
  }

  private _upcastTable() {
    return dispatcher => {
      dispatcher.on("element:figure", (evt, data, conversionApi) => {
        const viewTable = data.viewItem;

        if (!conversionApi.consumable.test(viewTable, { name: true })) {
          return;
        }

        for (const tableChild of Array.from(viewTable.getChildren())) {
          console.log(tableChild);
        }

        const block = conversionApi.writer.createElement("info-block");

        const splitResult = conversionApi.splitToAllowedParent(
          block,
          data.modelCursor
        );

        if (!splitResult) {
          return;
        }

        conversionApi.writer.insert(block, splitResult.position);
        conversionApi.consumable.consume(viewTable, { name: true });

        const modelCursor = conversionApi.writer.createPositionAt(block, 0);
        conversionApi.convertChildren(viewTable, modelCursor);

        debugger
        if (!viewTable.childCount) {
          const tableCell = conversionApi.writer.createElement("info-block-edit");
          conversionApi.writer.insertElement( 'paragraph', tableCell );
          conversionApi.writer.insert( tableCell, modelCursor );
        }

        data.modelRange = conversionApi.writer.createRange(
          conversionApi.writer.createPositionBefore(block),
          conversionApi.writer.createPositionAfter(block)
        );

        if (splitResult.cursorParent) {
          data.modelCursor = conversionApi.writer.createPositionAt(
            splitResult.cursorParent,
            0
          );
        } else {
          data.modelCursor = data.modelRange.end;
        }
      });
    };
  }
}

export function findAncestor( parentName, position ) {
	let parent = position.parent;

	while ( parent ) {
		if ( parent.name === parentName ) {
			return parent;
		}

		parent = parent.parent;
	}
}