import * as vscode from 'vscode';

function getOffsetReplacementText(editor: typeof vscode.window.activeTextEditor, selection: vscode.Selection, dir: string): { offset: vscode.Selection, newText: string } {
	if (!editor) {
		return { offset: selection, newText: '' };
	}

	const startChar = selection.start.character === 0 ? 0 : selection.start.character - 1;
	const endChar = selection.end.character + 1;
	
	const offsetSelection = new vscode.Selection(
		selection.start.line,
		startChar,
		selection.end.line,
		endChar
	);

	const offsetText = editor.document.getText(offsetSelection);
	const firstChar = offsetText.charAt(0);
	const lastChar = offsetText.charAt(offsetText.length - 1);
	let newText = '';

	if (dir === 'left') {
		if (selection.start.character === 0) {
			newText = offsetText;
		}
		else if (selection.end.character === editor.document.lineAt(selection.end.line).text.length) {
			newText = offsetText.substring(1, offsetText.length) + firstChar;
		}
		else {
			newText = offsetText.substring(1, offsetText.length - 1) + firstChar + lastChar;
		}
	}
	else {
		if (selection.start.character === 0) {
			newText = lastChar + offsetText.substring(0, offsetText.length - 1);
		}
		else if (selection.end.character === editor.document.lineAt(selection.end.line).text.length) {
			newText = offsetText;
		}
		else {
			newText = firstChar + lastChar + offsetText.substring(1, offsetText.length - 1);
		}
	}

	return { offset: offsetSelection, newText };
}
	

export function activate(context: vscode.ExtensionContext) {
	let moveLeft = vscode.commands.registerCommand('code-mover.moveLeft', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const selection = editor.selection;

		const {offset, newText} = getOffsetReplacementText(editor, selection, 'left');

		console.log(newText);

		editor.edit((editBuilder) => {
			editBuilder.replace(offset, newText);
		});

		if (selection.start.character !== 0) {
			editor.selection = new vscode.Selection(
				selection.start.line,
				selection.start.character - 1,
				selection.end.line,
				selection.end.character - 1
			);
		}
	});

	let moveRight = vscode.commands.registerCommand('code-mover.moveRight', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const selection = editor.selection;
		const {offset, newText} = getOffsetReplacementText(editor, selection, 'right');

		editor.edit((editBuilder) => {
			editBuilder.replace(offset, newText);
		});

		if (selection.end.character !== editor.document.lineAt(selection.end.line).text.length) {
			editor.selection = new vscode.Selection(
				selection.start.line,
				selection.start.character + 1,
				selection.end.line,
				selection.end.character + 1
			);
		}
	});

	context.subscriptions.push(moveLeft);
	context.subscriptions.push(moveRight);
}

export function deactivate() {}
