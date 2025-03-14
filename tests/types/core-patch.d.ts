import { Scope } from "eslint";
import * as ESTree from "estree";

/*
 * Need to extend the `RuleContext` interface to include the
 * deprecated methods that have not yet been removed.
 * TODO: Remove in ESLint v10.0.0.
 */
declare module "@eslint/core" {
	interface RuleContext {
		/** @deprecated Use `sourceCode.getAncestors()` instead */
		getAncestors(): ESTree.Node[];

		/** @deprecated Use `sourceCode.getDeclaredVariables()` instead */
		getDeclaredVariables(node: ESTree.Node): Scope.Variable[];

		/** @deprecated Use `sourceCode.getScope()` instead */
		getScope(): Scope.Scope;

		/** @deprecated Use `sourceCode.markVariableAsUsed()` instead */
		markVariableAsUsed(name: string): boolean;
	}
}
