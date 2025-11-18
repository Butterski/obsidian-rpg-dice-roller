// Type definitions for the D&D Dice Auto Command plugin

export interface DiceRollerSettings {
	discordPrefix: string;
	roll20Prefix: string;
	defaultPlatform: 'discord' | 'roll20';
}

export const DEFAULT_SETTINGS: DiceRollerSettings = {
	discordPrefix: '.r',
	roll20Prefix: '/roll',
	defaultPlatform: 'discord'
}

export interface DiceFormula {
	parts: DicePart[];
	advantage: boolean;
	disadvantage: boolean;
}

export interface DicePart {
	type: 'dice' | 'modifier';
	quantity?: number;      // for dice
	sides?: number;         // for dice
	modifier?: number;      // for modifiers
	operator: '+' | '-';
	operations?: string;    // e.g., "kh3", "ro<3" from d20 grammar
}

export interface DetectedRoll {
	text: string;
	formula: string;
	line: number;
	startIndex: number;
	endIndex: number;
}
