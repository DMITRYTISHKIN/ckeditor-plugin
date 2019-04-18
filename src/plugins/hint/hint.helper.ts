export const HINT_MODEL = 'hintContent';
export const HINT_VIEW = 'span';
export const HINT_ATTR = 'title';
export const HINT_SYMBOL = Symbol(HINT_MODEL);
export const HIGHLIGHT_CLASS = 'ck-hint_selected';

export function findHintRange(position, value, model) {
	return model.createRange(_findBound(position, value, true, model), _findBound(position, value, false, model));
}

export function clearText(str) {
	return str.replace(/<[^<|>]+?>|&nbsp;/gi,'');
}

function _findBound(position, value, lookBack, model) {
	let node = position.textNode || (lookBack ? position.nodeBefore : position.nodeAfter);

	let lastNode = null;

	while (node && node.getAttribute(HINT_MODEL) == value) {
		lastNode = node;
		node = lookBack ? node.previousSibling : node.nextSibling;
	}

	return lastNode ? model.createPositionAt(lastNode, lookBack ? 'before' : 'after') : position;
}
