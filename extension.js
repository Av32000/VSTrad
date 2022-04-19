// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const NLPCloudClient = require('nlpcloud');
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "traducteur" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('traducteur.helloWorld', function () {
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Traducteur !');
	});

	let traduction = vscode.commands.registerCommand('traducteur.traduction', function () {

		if (vscode.workspace.getConfiguration('traducteur').get('sourceLanguage') == vscode.workspace.getConfiguration('traducteur').get('language')) {
			vscode.window.showErrorMessage('La langue source et la langue cible sont identiques');
			return;
		}

		if (vscode.workspace.getConfiguration('traducteur').get('apiToken') == '') {
			vscode.window.showErrorMessage('Vous devez renseigner votre token d\'API');
			return;
		}
		const activeEditor = vscode.window.activeTextEditor;

		var selection = activeEditor.selection;
		var text = activeEditor.document.getText(selection);

		const client = new NLPCloudClient('opus-mt-' + vscode.workspace.getConfiguration('traducteur').get('sourceLanguage') + '-' + vscode.workspace.getConfiguration('traducteur').get('language'), vscode.workspace.getConfiguration('traducteur').get('apiToken'))

		client.translation(text).then(function (result) {
			console.log(result.status);
			let textReplace = text.replace(text, result.data.translation_text);

			let invalidRange = new vscode.Range(activeEditor.selection.start.line, activeEditor.selection.start.character, activeEditor.selection.end.line, activeEditor.selection.end.character);
			let validFullRange = activeEditor.document.validateRange(invalidRange);

			activeEditor.edit(editBuilder => {
				editBuilder.replace(validFullRange, textReplace);
			})
		}).catch(function (err) {
			console.log(err);
			vscode.window.showErrorMessage('Erreur lors de la traduction !');
		})

		//vscode.window.showInformationMessage();
	});

	let traductionSettings = vscode.commands.registerCommand('traducteur.traductionSettings', function () {
		// Display a message box to the user
		if (vscode.workspace.getConfiguration('traducteur').get('sourceLanguage') == vscode.workspace.getConfiguration('traducteur').get('language')) {
			vscode.window.showErrorMessage("❌ Langue Source et Cible identiques ❌");
			vscode.window.showInformationMessage("Langue Source : " + vscode.workspace.getConfiguration('traducteur').get('sourceLanguage'));
			vscode.window.showInformationMessage("Langue Cible : " + vscode.workspace.getConfiguration('traducteur').get('language'));
		} else {
			vscode.window.showInformationMessage("✅ La langue source et la langue cible sont différentes ✅");
			vscode.window.showInformationMessage("\nLangue Cible : " + vscode.workspace.getConfiguration('traducteur').get('language'));
			vscode.window.showInformationMessage("Langue Source : " + vscode.workspace.getConfiguration('traducteur').get('sourceLanguage'));
		}

	});


	context.subscriptions.push(disposable, traduction, traductionSettings);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
