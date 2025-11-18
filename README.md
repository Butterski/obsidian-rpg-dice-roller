# RPG Dice Roller

An Obsidian plugin for building RPG dice roll commands with d20 syntax. Create dice formulas visually with advantage/disadvantage support for Discord and Roll20.

## Features

- **Visual Dice Formula Builder** - Build complex dice formulas using an intuitive UI in a side panel
- **d20 Grammar Support** - Full support for advanced dice operations (keep highest, reroll, explode, etc.)
- **Platform-Specific Commands** - Generate commands formatted for Discord bots or Roll20
- **Advantage/Disadvantage** - Built-in support for D&D 5e advantage and disadvantage mechanics
- **Smart Detection** - Automatically detect dice formulas in your open notes
- **Interactive ROLL Syntax** - Create clickable dice rolls with `ROLL[formula]` syntax
- **Quick Insertion** - Copy commands to clipboard or insert directly into your notes
- **Mobile Support** - Works on desktop and mobile devices

## Usage

### Opening the Dice Roller

There are three ways to open the dice roller:

1. Click the dice icon (🎲) in the ribbon (left sidebar)
2. Use the command palette: "Open Dice Roller"
3. Use keyboard shortcut (if configured)

The dice roller will open in the right sidebar.

### Building a Dice Formula

1. **Add dice** - Click the buttons next to each die type (d4, d6, d8, d10, d12, d20, d100)
   - Use the number input to specify quantity
   - Click `+` to add dice with a positive modifier
   - Click `-` to subtract dice (rare, but supported)

2. **Add modifiers** - Enter a number in the modifier input
   - Click `+` to add a positive modifier
   - Click `-` to subtract a modifier
   - Use quick buttons for common modifiers (+1 through +5)

3. **Set advantage/disadvantage** - Click "Advantage" or "Disadvantage" buttons
   - These are exclusive options (only one can be active)
   - Typical for D&D 5e d20 rolls

4. **Advanced operations** - You can add d20 grammar operations manually
   - Examples: `2d6kh1` (keep highest), `1d20ro<5` (reroll once if less than 5)

### Using Your Formula

Once you've built your formula, you have several options:

- **Copy Command** - Copies the full command to clipboard (e.g., `.r 2d6 + 1d4 + 3`)
- **Insert to Note** - Inserts the command at your cursor position in the active note
- **Create ROLL[...] Syntax** - Creates a clickable inline syntax (e.g., `` `ROLL[2d6+3]` ``)

### Interactive ROLL Syntax

You can embed dice formulas in your notes using the `ROLL[...]` syntax:

```markdown
Attack the goblin: `ROLL[1d20+5]`
Deal damage: `ROLL[2d6+3]`
Fireball damage: `ROLL[8d6]`
```

In reading mode, these become clickable. When clicked:
- The dice roller opens automatically
- The formula is loaded into the builder
- You can then generate the command for your platform

### Suggestions from Notes

The dice roller automatically scans your open notes for:
- **ROLL syntax** - Any `ROLL[formula]` instances
- **Inline formulas** - Plain dice formulas like "2d6 + 4"

Found formulas appear in the "Suggestions" section:
- Click a suggestion to **replace** your current formula
- Click "Add" to **append** the suggestion to your current formula

### d20 Grammar Operations

This plugin supports the full d20 dice rolling grammar. Add operations directly after dice notation:

#### Keep/Drop Operations
- `2d20kh1` - Keep highest 1 (advantage)
- `2d20kl1` - Keep lowest 1 (disadvantage)
- `4d6kh3` - Keep highest 3 (ability score generation)
- `4d6p1` - Drop lowest 1 (same as above, different syntax)

#### Reroll Operations
- `1d20ro<5` - Reroll once if less than 5
- `1d6rr<3` - Reroll repeatedly until not less than 3
- `1d20ra=1` - Reroll and add if exactly 1 (critical fumble recovery)

#### Exploding Dice
- `1d6e=6` - Explode on 6 (roll additional die when you roll max)
- `2d10e>8` - Explode on 9 or 10

#### Min/Max Operations
- `1d20mi10` - Minimum value is 10 (can't roll below 10)
- `1d20ma15` - Maximum value is 15 (can't roll above 15)

#### Complex Examples
```
2d20kh1+5           # Advantage with +5 modifier
4d6kh3              # Standard ability score generation
8d6ro<2             # 8d6 but reroll any 1s once
1d20+2d6e=6+3       # Attack with exploding damage dice
```

## Settings

Access settings via **Settings → RPG Dice Roller**

### Default Platform
Choose whether commands are formatted for Discord or Roll20 by default.
- **Discord** - Most Discord dice bots
- **Roll20** - Roll20 virtual tabletop

### Discord Command Prefix
The prefix used for Discord bot commands.
- Default: `.r`
- Common alternatives: `!roll`, `/roll`, `!r`

### Roll20 Command Prefix
The prefix used for Roll20 commands.
- Default: `/roll`
- Alternative: `/r`

## Examples

### Basic Roll
- Formula: `1d20 + 5`
- Discord: `.r 1d20 + 5`
- Roll20: `/roll 1d20 + 5`

### Attack with Advantage
- Formula: `1d20 + 5 adv`
- Result: `.r 1d20 + 5 adv`

### Damage Roll
- Formula: `2d6 + 1d4 + 3`
- Result: `.r 2d6 + 1d4 + 3`

### Fireball with Keep Highest
- Formula: `8d6kh7` (8d6 but ignore lowest die)
- Result: `.r 8d6kh7`

### Ability Score Generation
- Formula: `4d6kh3` (roll 4d6, keep highest 3)
- Result: `.r 4d6kh3`

## Installation

### From Obsidian Community Plugins (Recommended)

1. Open **Settings** in Obsidian
2. Navigate to **Community plugins**
3. Select **Browse** and search for "RPG Dice Roller"
4. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest release from GitHub
2. Extract `main.js`, `manifest.json`, and `styles.css` to your vault's plugins folder:
   ```
   <vault>/.obsidian/plugins/rpg-dice-roller/
   ```
3. Reload Obsidian
4. Enable the plugin in **Settings → Community plugins**

## Development

### Prerequisites
- Node.js (LTS version recommended, 18+)
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/Butterski/obsidian-dnd-dice-auto-command.git
cd obsidian-dnd-dice-auto-command

# Install dependencies
npm install

# Build for development (with watch mode)
npm run dev

# Build for production
npm run build
```

### Project Structure

```
src/
  main.ts           # Plugin entry point, lifecycle management
  settings.ts       # Settings interface and tab
  types.ts          # TypeScript interfaces
  parser.ts         # Dice formula parser and validator
  processor.ts      # Markdown post-processor for ROLL syntax
  view.ts           # Dice builder UI view
  ui/               # UI components
  utils/            # Utility functions

manifest.json       # Plugin metadata
styles.css          # Plugin styles
esbuild.config.mjs  # Build configuration
```

### Testing

For manual testing, copy the built files to your vault:

```bash
cp main.js manifest.json styles.css <vault>/.obsidian/plugins/rpg-dice-roller/
```

Then reload Obsidian and enable the plugin.

## d20 Grammar Reference

### Operators

| Syntax | Name | Description |
|--------|------|-------------|
| k | keep | Keeps all matched values |
| p | drop | Drops all matched values |
| rr | reroll | Rerolls all matched values until none match |
| ro | reroll once | Rerolls all matched values once |
| ra | reroll and add | Rerolls up to one matched value once, keeping the original |
| e | explode on | Rolls another die for each matched value |
| mi | minimum | Sets the minimum value of each die |
| ma | maximum | Sets the maximum value of each die |

### Selectors

| Syntax | Name | Description |
|--------|------|-------------|
| X | literal | All values literally equal to X |
| hX | highest X | The highest X values |
| lX | lowest X | The lowest X values |
| >X | greater than X | All values greater than X |
| <X | less than X | All values less than X |

### Binary Operations

| Syntax | Operation |
|--------|-----------|
| X * Y | multiplication |
| X / Y | division |
| X // Y | integer division |
| X % Y | modulo |
| X + Y | addition |
| X - Y | subtraction |

## Support

- **Issues**: [GitHub Issues](https://github.com/Butterski/obsidian-dnd-dice-auto-command/issues)
- **Author**: [Miłosz Kucharski](https://mzkuch.pl)
- **Funding**: [GitHub Sponsors](https://github.com/sponsors/Butterski)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- Based on the d20 dice rolling grammar
- Built for the Obsidian community
- Designed for tabletop RPG players and game masters

## Changelog

### 1.0.0
- Initial release
- Visual dice formula builder
- d20 grammar support
- Discord and Roll20 command formatting
- Interactive ROLL syntax
- Smart formula detection in notes
- Advantage/disadvantage support
- Mobile compatibility
