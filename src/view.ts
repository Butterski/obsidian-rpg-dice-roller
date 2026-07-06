// Dice builder view - side panel UI for building dice formulas

import { ItemView, WorkspaceLeaf, MarkdownView, Notice } from 'obsidian';
import { DiceFormula, DicePart } from './types';
import { DiceParser } from './parser';
import { buildDiceCommand } from './command-format';
import DiceRollerPlugin from '../main';

export const DICE_BUILDER_VIEW_TYPE = 'dice-builder-view';

export class DiceBuilderView extends ItemView {
	plugin: DiceRollerPlugin;
	private currentFormula: DiceFormula;
	private builderContainer: HTMLElement;
	private suggestionsContainer: HTMLElement;

	constructor(leaf: WorkspaceLeaf, plugin: DiceRollerPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.currentFormula = { parts: [], advantage: false, disadvantage: false };
	}

	getViewType(): string {
		return DICE_BUILDER_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Dice Roller';
	}

	getIcon(): string {
		return 'dice';
	}

	async onOpen(): Promise<void> {
		this.contentEl.empty();
		this.contentEl.addClass('dice-builder-container');

		this.builderContainer = this.contentEl.createDiv({ cls: 'dice-builder-section' });
		this.suggestionsContainer = this.contentEl.createDiv({ cls: 'dice-suggestions-section' });

		this.render();
	}

	async onClose(): Promise<void> {
		this.contentEl.empty();
	}

	private render(): void {
		this.renderBuilder();
		this.renderSuggestions();
	}

	private renderBuilder(): void {
		this.builderContainer.empty();
		const container = this.builderContainer;

		// Title
		const titleEl = container.createEl('h4', { text: 'Dice formula builder' });
		titleEl.addClass('dice-builder-title');

		// Formula display
		const displaySection = container.createDiv({ cls: 'dice-formula-display' });
		const formulaText = DiceParser.toString(this.currentFormula) || '(empty)';
		displaySection.createEl('div', { 
			text: formulaText,
			cls: 'dice-formula-text'
		});

		// Clear button
		const clearBtn = displaySection.createEl('button', { text: 'Clear' });
		clearBtn.addClass('dice-clear-button');
		clearBtn.onclick = () => {
			this.currentFormula = { parts: [], advantage: false, disadvantage: false };
			this.renderBuilder();
		};

		// Dice buttons section
		const diceSection = container.createDiv({ cls: 'dice-buttons-section' });
		diceSection.createEl('h5', { text: 'Add dice' });

		const diceTypes = [
			{ sides: 4, label: 'd4' },
			{ sides: 6, label: 'd6' },
			{ sides: 8, label: 'd8' },
			{ sides: 10, label: 'd10' },
			{ sides: 12, label: 'd12' },
			{ sides: 20, label: 'd20' },
			{ sides: 100, label: 'd100' }
		];

		diceTypes.forEach(dice => {
			const diceRow = diceSection.createDiv({ cls: 'dice-row' });
			
			// Quantity input
			const quantityInput = diceRow.createEl('input', {
				type: 'number',
				value: '1',
				attr: { min: '1', max: '99' }
			});
			quantityInput.addClass('dice-quantity-input');

			// Dice label
			diceRow.createEl('span', { text: dice.label, cls: 'dice-label' });

			// Add button
			const addBtn = diceRow.createEl('button', { text: '+' });
			addBtn.addClass('dice-add-button');
			addBtn.onclick = () => {
				const quantity = parseInt(quantityInput.value) || 1;
				this.addDice(quantity, dice.sides, '+');
			};

			// Subtract button
			const subBtn = diceRow.createEl('button', { text: '-' });
			subBtn.addClass('dice-subtract-button');
			subBtn.onclick = () => {
				const quantity = parseInt(quantityInput.value) || 1;
				this.addDice(quantity, dice.sides, '-');
			};
		});

		// Modifier section
		const modifierSection = container.createDiv({ cls: 'dice-modifier-section' });
		modifierSection.createEl('h5', { text: 'Add modifier' });

		const modifierRow = modifierSection.createDiv({ cls: 'dice-row' });
		const modifierInput = modifierRow.createEl('input', {
			type: 'number',
			attr: { placeholder: 'e.g., 4' }
		});
		modifierInput.addClass('dice-modifier-input');

		const addModBtn = modifierRow.createEl('button', { text: '+' });
		addModBtn.addClass('dice-add-button');
		addModBtn.onclick = () => {
			const value = parseInt(modifierInput.value);
			if (!isNaN(value)) {
				this.addModifier(value, '+');
				modifierInput.value = '';
			}
		};

		const subModBtn = modifierRow.createEl('button', { text: '-' });
		subModBtn.addClass('dice-subtract-button');
		subModBtn.onclick = () => {
			const value = parseInt(modifierInput.value);
			if (!isNaN(value)) {
				this.addModifier(value, '-');
				modifierInput.value = '';
			}
		};

		// Common modifiers
		const commonMods = modifierSection.createDiv({ cls: 'common-modifiers' });
		commonMods.createEl('span', { text: 'Common: ', cls: 'common-label' });
		[1, 2, 3, 4, 5].forEach(mod => {
			const btn = commonMods.createEl('button', { text: `+${mod}` });
			btn.addClass('common-modifier-button');
			btn.onclick = () => this.addModifier(mod, '+');
		});

		// Advantage/Disadvantage section
		const advDisSection = container.createDiv({ cls: 'dice-advdis-section' });
		advDisSection.createEl('h5', { text: 'Roll type' });

		const advDisRow = advDisSection.createDiv({ cls: 'dice-row' });

		const advBtn = advDisRow.createEl('button', { 
			text: 'Advantage',
			cls: this.currentFormula.advantage ? 'active' : ''
		});
		advBtn.addClass('dice-toggle-button');
		advBtn.onclick = () => {
			this.currentFormula.advantage = !this.currentFormula.advantage;
			if (this.currentFormula.advantage) {
				this.currentFormula.disadvantage = false;
			}
			this.renderBuilder();
		};

		const disBtn = advDisRow.createEl('button', { 
			text: 'Disadvantage',
			cls: this.currentFormula.disadvantage ? 'active' : ''
		});
		disBtn.addClass('dice-toggle-button');
		disBtn.onclick = () => {
			this.currentFormula.disadvantage = !this.currentFormula.disadvantage;
			if (this.currentFormula.disadvantage) {
				this.currentFormula.advantage = false;
			}
			this.renderBuilder();
		};

		// Action buttons
		const actionSection = container.createDiv({ cls: 'dice-action-section' });

		const copyBtn = actionSection.createEl('button', { text: 'Copy command' });
		copyBtn.addClass('dice-action-button');
		copyBtn.onclick = () => this.copyCommand();

		const insertBtn = actionSection.createEl('button', { text: 'Insert to note' });
		insertBtn.addClass('dice-action-button');
		insertBtn.onclick = () => this.insertToNote();

		const rollSyntaxBtn = actionSection.createEl('button', { text: 'Copy ROLL syntax' });
		rollSyntaxBtn.addClass('dice-action-button');
		rollSyntaxBtn.onclick = () => this.createRollSyntax();
	}

	private addDice(quantity: number, sides: number, operator: '+' | '-'): void {
		const part: DicePart = {
			type: 'dice',
			quantity,
			sides,
			operator
		};
		this.currentFormula.parts.push(part);
		this.renderBuilder();
	}

	private addModifier(value: number, operator: '+' | '-'): void {
		const part: DicePart = {
			type: 'modifier',
			modifier: value,
			operator
		};
		this.currentFormula.parts.push(part);
		this.renderBuilder();
	}


	private async copyCommand(): Promise<void> {
		const formula = DiceParser.toString(this.currentFormula);
		if (!formula) {
			new Notice('No dice formula to copy!');
			return;
		}

		const command = buildDiceCommand(this.plugin.settings, formula);
		await navigator.clipboard.writeText(command);
		new Notice('Command copied to clipboard!');
	}

	private async insertToNote(): Promise<void> {
		const formula = DiceParser.toString(this.currentFormula);
		if (!formula) {
			new Notice('No dice formula to insert!');
			return;
		}

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) {
			new Notice('No active note to insert into!');
			return;
		}

		const command = buildDiceCommand(this.plugin.settings, formula);
		const editor = view.editor;
		editor.replaceSelection(command);
		new Notice('Command inserted!');
	}

	private async createRollSyntax(): Promise<void> {
		const formula = DiceParser.toString(this.currentFormula);
		if (!formula) {
			new Notice('No dice formula!');
			return;
		}

		const rollSyntax = `\`ROLL[${formula}]\``;
		await navigator.clipboard.writeText(rollSyntax);
		new Notice('ROLL syntax copied to clipboard!');
	}

	private renderSuggestions(): void {
		const container = this.suggestionsContainer;
		container.empty();
		
		container.createEl('h5', { text: 'Suggestions from open notes' });

		// Get all open markdown views
		const markdownLeaves = this.app.workspace.getLeavesOfType('markdown');
		
		if (markdownLeaves.length === 0) {
			container.createEl('p', { 
				text: 'No open notes',
				cls: 'dice-no-suggestions'
			});
			return;
		}

		// Collect content from all open editors
		let allContent = '';
		const contentByFile = new Map<string, string>();
		
		markdownLeaves.forEach(leaf => {
			const view = leaf.view;
			if (view instanceof MarkdownView) {
				const fileName = view.file?.basename || 'Untitled';
				const content = view.editor.getValue();
				contentByFile.set(fileName, content);
				allContent += content + '\n';
			}
		});

		const content = allContent;
		
		// Detect ROLL[...] syntax
		const rollSyntaxMatches = DiceParser.detectRollSyntax(content);
		
		// Detect inline formulas (if enabled)
		let inlineMatches: Array<{formula: string, start: number, end: number}> = [];
		if (this.plugin.settings.enableInlineFormulas) {
			inlineMatches = DiceParser.detectInlineFormulas(content);
		}

		const allMatches = [
			...rollSyntaxMatches.map(m => ({ formula: m.formula, source: '📌 ROLL' })),
			...inlineMatches.map(m => ({ formula: m.formula, source: '📝 inline' }))
		];

		// Remove duplicates
		const uniqueFormulas = new Map<string, { formula: string, source: string }>();
		allMatches.forEach(m => {
			const key = m.formula;
			if (!uniqueFormulas.has(key)) {
				uniqueFormulas.set(key, m);
			}
		});

		if (uniqueFormulas.size === 0) {
			container.createEl('p', { 
				text: 'No dice formulas found in current note',
				cls: 'dice-no-suggestions'
			});
			return;
		}

		const suggestionsList = container.createDiv({ cls: 'dice-suggestions-list' });
		
		uniqueFormulas.forEach((match) => {
			const suggestionItem = suggestionsList.createDiv({ cls: 'dice-suggestion-item' });
			
			const leftSection = suggestionItem.createDiv({ cls: 'dice-suggestion-left' });
			
			leftSection.createEl('span', { 
				text: match.formula,
				cls: 'dice-suggestion-formula'
			});
			
			leftSection.createEl('span', { 
				text: match.source,
				cls: 'dice-suggestion-source'
			});

			// Click on left section to replace
			leftSection.onclick = (e) => {
				e.stopPropagation();
				const parsed = DiceParser.parse(match.formula);
				if (parsed) {
					this.currentFormula = parsed;
					this.renderBuilder();
					new Notice(`Loaded: ${match.formula}`);
				}
			};

			// Add button to add to current formula
			const addBtn = suggestionItem.createEl('button', { 
				text: 'Add',
				cls: 'dice-suggestion-add-btn'
			});
			
			addBtn.onclick = (e) => {
				e.stopPropagation();
				const parsed = DiceParser.parse(match.formula);
				if (parsed) {
					// Add the parts from the suggestion to current formula
					parsed.parts.forEach(part => {
						this.currentFormula.parts.push(part);
					});
					
					// If suggestion has advantage/disadvantage, apply it
					if (parsed.advantage) {
						this.currentFormula.advantage = true;
						this.currentFormula.disadvantage = false;
					}
					if (parsed.disadvantage) {
						this.currentFormula.disadvantage = true;
						this.currentFormula.advantage = false;
					}
					
					this.renderBuilder();
					new Notice(`Added: ${match.formula}`);
				}
			};
		});
	}

	public refresh(): void {
		this.render();
	}

	public loadFormula(formula: DiceFormula): void {
		this.currentFormula = formula;
		this.renderBuilder();
	}
}
