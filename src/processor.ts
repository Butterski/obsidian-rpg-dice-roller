// Post-processor to make ROLL[...] syntax clickable in reading mode

import { MarkdownPostProcessorContext, Notice } from 'obsidian';
import { DiceParser } from './parser';
import DiceRollerPlugin from '../main';
import { DiceBuilderView } from './view';

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
				codeEl.style.cursor = 'pointer';
				
				// Add click handler
				codeEl.addEventListener('click', async (e) => {
					e.preventDefault();
					e.stopPropagation();
					
					const parsed = DiceParser.parse(formula);
					
					if (parsed) {
						// Find the dice view and load the formula
						const leaves = plugin.app.workspace.getLeavesOfType('dice-builder-view');
						
						if (leaves.length > 0) {
							const view = leaves[0].view;
							if (view instanceof DiceBuilderView) {
								view.loadFormula(parsed);
								plugin.app.workspace.revealLeaf(leaves[0]);
								new Notice(`Loaded dice formula: ${formula}`);
							}
						} else {
							// Open the dice view first
							await plugin.activateDiceView();
							// Wait a bit for the view to open
							setTimeout(() => {
								const newLeaves = plugin.app.workspace.getLeavesOfType('dice-builder-view');
								if (newLeaves.length > 0) {
									const view = newLeaves[0].view;
									if (view instanceof DiceBuilderView) {
										view.loadFormula(parsed);
										new Notice(`Loaded dice formula: ${formula}`);
									}
								}
							}, 100);
						}
					}
				});
				
				// Add hover effect
				codeEl.addEventListener('mouseenter', () => {
					codeEl.style.transform = 'translateY(-1px)';
					codeEl.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
				});
				
				codeEl.addEventListener('mouseleave', () => {
					codeEl.style.transform = '';
					codeEl.style.boxShadow = '';
				});
			}
		});
	});
}
