import * as Lint from "tslint";
import * as ts from "typescript";


const OPTION_NEWLINES_DEFAULT = 2;

export class Rule extends Lint.Rules.AbstractRule {

	/* tslint:disable:object-literal-sort-keys */
	public static metadata: Lint.IRuleMetadata = {
		ruleName: "newline-after-imports",
		description: "Requires a certain number of newlines after the import block",
		hasFix: true,
		rationale: Lint.Utils.dedent`
			Visually separating the imports from the rest of the code allows files to be more readable`,
		optionsDescription: "An integer indicating the number of newlines.",
		options: {
			type: "number",
			minimum: "0",
			default: OPTION_NEWLINES_DEFAULT
		},
		optionExamples: [
			true,
			[true, 2]
		],
		type: "maintainability",
		typescriptOnly: false
	};
	/* tslint:enable:object-literal-sort-keys */

	public static FAILURE_STRING(currentNewlines: number, expectedNewlines: number): string {
		return `Invalid number of newlines after imports. Expected ${expectedNewlines}, got ${currentNewlines}.`;
	}

	public getRuleOptions(): number {
		return this.ruleArguments[0] || OPTION_NEWLINES_DEFAULT;
	}

	public isEnabled(): boolean {
		return super.isEnabled() && this.getRuleOptions() >= 0;
	}

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

		const expectedNewlines = this.getRuleOptions();
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
