import { DiceRollerSettings } from './types';

export function getCommandPrefix(settings: DiceRollerSettings): string {
	return settings.defaultPlatform === 'discord'
		? settings.discordPrefix
		: settings.roll20Prefix;
}

export function buildDiceCommand(settings: DiceRollerSettings, formula: string): string {
	return `${getCommandPrefix(settings)} ${formula}`;
}