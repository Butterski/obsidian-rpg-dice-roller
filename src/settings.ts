// Settings tab for the Dice Roller plugin

import { App, PluginSettingTab, Setting } from 'obsidian';
import DiceRollerPlugin from '../main';

export class DiceRollerSettingTab extends PluginSettingTab {
	plugin: DiceRollerPlugin;

	constructor(app: App, plugin: DiceRollerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('RPG Dice Roller Settings')
			.setHeading();

		new Setting(containerEl)
			.setName('Default platform')
			.setDesc('Choose whether to format commands for Discord or Roll20 by default')
			.addDropdown(dropdown => dropdown
				.addOption('discord', 'Discord')
				.addOption('roll20', 'Roll20')
				.setValue(this.plugin.settings.defaultPlatform)
				.onChange(async (value: 'discord' | 'roll20') => {
					this.plugin.settings.defaultPlatform = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Discord command prefix')
			.setDesc('The prefix for Discord bot commands (e.g., .r, !roll, /roll)')
			.addText(text => text
				.setPlaceholder('.r')
				.setValue(this.plugin.settings.discordPrefix)
				.onChange(async (value) => {
					this.plugin.settings.discordPrefix = value || '.r';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Roll20 command prefix')
			.setDesc('The prefix for Roll20 commands (e.g., /roll, /r)')
			.addText(text => text
				.setPlaceholder('/roll')
				.setValue(this.plugin.settings.roll20Prefix)
				.onChange(async (value) => {
					this.plugin.settings.roll20Prefix = value || '/roll';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Enable inline formula detection')
			.setDesc('Automatically detect dice formulas like "1d20 + 5" in your notes. If disabled, only ROLL[...] syntax will be detected.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableInlineFormulas)
				.onChange(async (value) => {
					this.plugin.settings.enableInlineFormulas = value;
					await this.plugin.saveSettings();
					this.plugin.refreshDiceView();
				}));

		containerEl.createEl('h3', { text: 'About' });
		
		const aboutDiv = containerEl.createDiv({ cls: 'dice-roller-about' });
		aboutDiv.createEl('p', { 
			text: 'This plugin helps you build RPG dice roll commands using d20 syntax.' 
		});
		aboutDiv.createEl('p', { 
			text: 'Features:' 
		});
		const featuresList = aboutDiv.createEl('ul');
		featuresList.createEl('li', { text: 'Visual dice formula builder' });
		featuresList.createEl('li', { text: 'Support for advantage/disadvantage' });
		featuresList.createEl('li', { text: 'Detect dice formulas in your notes' });
		featuresList.createEl('li', { text: 'ROLL[...] syntax for clickable dice rolls' });
		featuresList.createEl('li', { text: 'd20 grammar support (operators like kh, ro, etc.)' });
	}
}
