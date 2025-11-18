import { Plugin, WorkspaceLeaf } from 'obsidian';
import { DiceRollerSettings, DEFAULT_SETTINGS } from './src/types';
import { DiceBuilderView, DICE_BUILDER_VIEW_TYPE } from './src/view';
import { DiceRollerSettingTab } from './src/settings';
import { registerRollSyntaxProcessor } from './src/processor';

export default class DiceRollerPlugin extends Plugin {
	settings: DiceRollerSettings;

	async onload() {
		await this.loadSettings();

		// Register the dice builder view
		this.registerView(
			DICE_BUILDER_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new DiceBuilderView(leaf, this)
		);

		// Add ribbon icon to open dice roller
		this.addRibbonIcon('dice', 'Open Dice Roller', () => {
			this.activateDiceView();
		});

		// Add command to open dice roller
		this.addCommand({
			id: 'open-dice-roller',
			name: 'Open Dice Roller',
			callback: () => {
				this.activateDiceView();
			}
		});

		// Add command to refresh suggestions
		this.addCommand({
			id: 'refresh-dice-suggestions',
			name: 'Refresh Dice Suggestions',
			callback: () => {
				this.refreshDiceView();
			}
		});

		// Add settings tab
		this.addSettingTab(new DiceRollerSettingTab(this.app, this));

		// Register markdown post-processor for clickable ROLL syntax
		registerRollSyntaxProcessor(this);

		// Refresh suggestions when active file changes
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				this.refreshDiceView();
			})
		);
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(DICE_BUILDER_VIEW_TYPE);
	}

	async activateDiceView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(DICE_BUILDER_VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({
					type: DICE_BUILDER_VIEW_TYPE,
					active: true,
				});
			}
		}

		// Reveal the leaf in case it is in a collapsed sidebar
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	refreshDiceView() {
		const leaves = this.app.workspace.getLeavesOfType(DICE_BUILDER_VIEW_TYPE);
		if (leaves.length > 0) {
			const view = leaves[0].view;
			if (view instanceof DiceBuilderView) {
				view.refresh();
			}
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
