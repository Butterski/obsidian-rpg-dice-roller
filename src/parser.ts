// Dice formula parser and validator based on d20 grammar

import { DiceFormula, DicePart } from './types';

export class DiceParser {
	/**
	 * Parses a dice formula string into structured components
	 * Example: "2d6 + 1d10 + 4" or "1d20kh1 + 5"
	 */
	static parse(formula: string): DiceFormula | null {
		try {
			const parts: DicePart[] = [];
			let advantage = false;
			let disadvantage = false;

			// Remove spaces for easier parsing
			let cleanFormula = formula.trim().replace(/\s+/g, '');
			
			// Check for advantage/disadvantage at the end
			if (cleanFormula.toLowerCase().endsWith('adv') || cleanFormula.toLowerCase().endsWith('advantage')) {
				advantage = true;
				cleanFormula = cleanFormula.replace(/adv(antage)?$/i, '');
			}
			if (cleanFormula.toLowerCase().endsWith('dis') || cleanFormula.toLowerCase().endsWith('disadvantage')) {
				disadvantage = true;
				cleanFormula = cleanFormula.replace(/dis(advantage)?$/i, '');
			}

			// Split by + and - operators, keeping the operators
			const regex = /([+-]?)(\d*d\d+(?:[a-z]+[<>]?\d+)?|\d+)/gi;
			let match;

			while ((match = regex.exec(cleanFormula)) !== null) {
				const operator = match[1] || '+';
				const term = match[2];

				if (term.includes('d')) {
					// It's a dice term
					const diceMatch = term.match(/(\d*)d(\d+)([a-z]+[<>]?\d+)?/i);
					if (diceMatch) {
						const quantity = parseInt(diceMatch[1] || '1');
						const sides = parseInt(diceMatch[2]);
						const operations = diceMatch[3] || undefined;

						parts.push({
							type: 'dice',
							quantity,
							sides,
							operator: operator as '+' | '-',
							operations
						});
					}
				} else {
					// It's a modifier
					const modifierValue = parseInt(term);
					if (!isNaN(modifierValue)) {
						parts.push({
							type: 'modifier',
							modifier: modifierValue,
							operator: operator as '+' | '-'
						});
					}
				}
			}

			return {
				parts,
				advantage,
				disadvantage
			};
		} catch {
			return null;
		}
	}

	/**
	 * Converts a DiceFormula back to string representation
	 */
	static toString(formula: DiceFormula): string {
		let result = '';

		formula.parts.forEach((part, index) => {
			if (index === 0 && part.operator === '+') {
				// Skip leading + operator
			} else {
				result += part.operator === '+' ? ' + ' : ' - ';
			}

			if (part.type === 'dice') {
				result += `${part.quantity}d${part.sides}`;
				if (part.operations) {
					result += part.operations;
				}
			} else {
				result += part.modifier;
			}
		});

		// Clean up leading space
		result = result.trim();
		
		if (formula.advantage) {
			result += ' adv';
		}
		if (formula.disadvantage) {
			result += ' dis';
		}

		return result;
	}

	/**
	 * Detects ROLL[...] syntax in text
	 * Example: `ROLL[2d6+5d10+4]`
	 */
	static detectRollSyntax(text: string): Array<{formula: string, fullMatch: string, start: number, end: number}> {
		const regex = /`?ROLL\[([^\]]+)\]`?/gi;
		const results = [];
		let match;

		while ((match = regex.exec(text)) !== null) {
			results.push({
				formula: match[1],
				fullMatch: match[0],
				start: match.index,
				end: match.index + match[0].length
			});
		}

		return results;
	}

	/**
	 * Detects inline dice formulas in text
	 * Example: "Roll 2d6 + 4 for damage" or "Attack: 1d20 + 5"
	 */
	static detectInlineFormulas(text: string): Array<{formula: string, start: number, end: number}> {
		// Match common dice patterns: XdY, XdY+Z, XdY-Z, Z+XdY, etc.
		// We match a sequence of terms (dice or numbers) separated by + or -
		// Then we filter to ensure at least one dice term is present
		const regex = /((?:\d*d\d+(?:[a-z]+[<>]?\d+)?|\d+)(?:\s*[+-]\s*(?:\d*d\d+(?:[a-z]+[<>]?\d+)?|\d+))*(?:\s+(?:adv|dis|advantage|disadvantage))?)/gi;
		const results = [];
		let match;

		while ((match = regex.exec(text)) !== null) {
			const formula = match[1].trim();
			
			// Must contain a 'd' to be a dice formula (avoids matching just "5 + 5")
			if (!formula.toLowerCase().includes('d')) {
				continue;
			}

			// Validate it's a real dice formula
			if (this.parse(formula)) {
				results.push({
					formula,
					start: match.index,
					end: match.index + match[0].length
				});
			}
		}

		return results;
	}

	/**
	 * Validates if a string is a valid dice formula
	 */
	static isValid(formula: string): boolean {
		return this.parse(formula) !== null;
	}
}
