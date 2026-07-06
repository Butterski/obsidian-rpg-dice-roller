// Post-processor to make ROLL[...] syntax clickable in reading mode

import { MarkdownPostProcessorContext, Notice } from 'obsidian';
import { DiceParser } from './parser';
import DiceRollerPlugin from '../main';
import { DiceBuilderView } from './view';
import { buildDiceCommand } from './command-format';

export function registerRollSyntaxProcessor(plugin: DiceRollerPlugin) {
	plugin.registerMarkdownPostProcessor((element: HTMLElement, context: MarkdownPostProcessorContext) => {
		// Find all code elements
		const codeElements = element.querySelectorAll('code');
		
		codeElements.forEach((codeEl) => {
			const text = codeEl.textContent || '';
			
			// Check if it contains ROLL[...] syntax
			const rollMatches = DiceParser.detectRollSyntax(text);
			
			if (rollMatches.length > 0) {
				// Style the code element
				codeEl.addClass('dice-roll-syntax');
				
				// Add the formula as a data attribute for CSS display
				const formula = rollMatches[0].formula;
				codeEl.setAttribute('data-formula', formula);
				
				// Make it clickable
				codeEl.addClass('dice-roll-clickable');
				codeEl.setAttribute('title', 'Click to load in dice builder. Ctrl-click to copy command.');
				
				// Add click handler
				codeEl.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					
					const parsed = DiceParser.parse(formula);
					
					if (parsed) {
						void (async () => {
							if (e.ctrlKey || e.metaKey) {
								const command = buildDiceCommand(plugin.settings, formula);
								await navigator.clipboard.writeText(command);
								new Notice(`Copied command: ${command}`);
								return;
							}

							// Find the dice view and load the formula
							const leaves = plugin.app.workspace.getLeavesOfType('dice-builder-view');
							
							if (leaves.length > 0) {
								const view = leaves[0].view;
								if (view instanceof DiceBuilderView) {
									view.loadFormula(parsed);
									
									// Use window.setTimeout per popout window guidelines
									window.setTimeout(() => {
										void plugin.app.workspace.revealLeaf(leaves[0]);
									}, 10);
									
									new Notice(`Loaded dice formula: ${formula}`);
								}
							} else {
								// Open the dice view first
								const view = await plugin.activateDiceView();
								if (view) {
									view.loadFormula(parsed);
									new Notice(`Loaded dice formula: ${formula}`);
								}
							}
						})();
					}
				});
			}
		});
	});
}
