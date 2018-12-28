import * as Lint from "tslint";
import * as ts from "typescript";


export class Rule extends Lint.Rules.AbstractRule {
	public static FAILURE_STRING = (current: number, expected: number) => `Invalid number of newlines after imports. Expected ${expected}, got ${current}.`;
	public static DEFAULT_NEWLINES = 2;

	private endOfImportsRegEx = new RegExp("(?:^import.*from.*(\r?\n))+", "gm");
	private firstNonEmptyLineRegex = new RegExp("^[^\r\n]", "gm");

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
		const source = sourceFile.text;
		const match = this.endOfImportsRegEx.exec(source);

		if (!match) {
			return [];
		}
		const lineEnding = match[1];

		// Continue after the last import statement
		this.firstNonEmptyLineRegex.lastIndex = this.endOfImportsRegEx.lastIndex;
		this.firstNonEmptyLineRegex.test(source);

		const errorStart = this.endOfImportsRegEx.lastIndex;
		const errorEnd = this.firstNonEmptyLineRegex.lastIndex - 1;

		const lastImportLine = sourceFile.getLineAndCharacterOfPosition(errorStart).line + 1;
		const firstNonEmptyLine = sourceFile.getLineAndCharacterOfPosition(errorEnd).line + 1;

		const expectedNewlines = (this.ruleArguments.length > 0 && <number>this.ruleArguments[0]) || Rule.DEFAULT_NEWLINES;
		const currentNewlines = firstNonEmptyLine - lastImportLine;

		if (currentNewlines === expectedNewlines) {
			return [];
		}

		const fix = Lint.Replacement.replaceFromTo(
			errorStart,
			errorEnd,
			lineEnding.repeat(expectedNewlines)
		);

		return [
			new Lint.RuleFailure(
				sourceFile,
				errorStart,
				errorEnd,
				Rule.FAILURE_STRING(currentNewlines, expectedNewlines),
				this.ruleName,
				fix,
			),
		];
	}
}
