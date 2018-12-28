import * as Lint from "tslint";
import * as ts from "typescript";


interface RuleOptions {
	newlines: number;
}

export class Rule extends Lint.Rules.AbstractRule {
	public static FAILURE_STRING = (current: number, expected: number) => `Invalid number of newlines after imports. Expected ${expected}, got ${current}.`;
	public static DEFAULT_NEWLINES = 2;

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
		// Call `applyWithFunction` with your callback function, `walk`.
		// This creates a `WalkContext<T>` and passes it in as an argument.
		// An optional 3rd parameter allows you to pass in a parsed version of `this.ruleArguments`. If used, it is not recommended to
		//     simply pass in `this.getOptions()`, but to parse it into a more useful object instead.
		const options: RuleOptions = {
			newlines: (this.ruleArguments.length > 0 && this.ruleArguments[0]) || Rule.DEFAULT_NEWLINES
		}

		return this.applyWithFunction(sourceFile, walk, options);
	}
}

function walk(context: Lint.WalkContext<RuleOptions>) {
	const endOfImportsRegEx = new RegExp("(^import.*from.*\r?\n)+", "gm");
	const firstNonEmptyLineRegex = new RegExp("^[^\r\n]", "gm");

	const source = context.sourceFile.text;
	const hasImports = endOfImportsRegEx.test(source);

	if (!hasImports) {
		return;
	}

	// Continue after the last import
	firstNonEmptyLineRegex.lastIndex = endOfImportsRegEx.lastIndex;
	firstNonEmptyLineRegex.test(source);

	const lastImportLine = context.sourceFile.getLineAndCharacterOfPosition(endOfImportsRegEx.lastIndex).line + 1;
	const firstNonEmptyLine = context.sourceFile.getLineAndCharacterOfPosition(firstNonEmptyLineRegex.lastIndex).line + 1;

	const expectedNewlines = context.options.newlines;
	const currentNewlines = firstNonEmptyLine - lastImportLine;

	if (currentNewlines !== expectedNewlines) {
		return context.addFailureAt(
			endOfImportsRegEx.lastIndex,
			firstNonEmptyLineRegex.lastIndex - endOfImportsRegEx.lastIndex - 1,
			Rule.FAILURE_STRING(currentNewlines, expectedNewlines));
	}
}
