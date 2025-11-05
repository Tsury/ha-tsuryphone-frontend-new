# TsuryPhone Card

A modern, Android Pixel 8-style phone and contacts interface for the TsuryPhone Home Assistant integration.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/v/release/Tsury/ha-tsuryphone-frontend-new)](https://github.com/Tsury/ha-tsuryphone-frontend-new/releases)
[![License](https://img.shields.io/github/license/Tsury/ha-tsuryphone-frontend-new)](LICENSE)

## Current Status

**Version**: 0.1.0-alpha (Early Alpha)

This is an early alpha release with the following features:

- ✅ Navigation system (Home, Keypad, Contacts tabs)
- ✅ Home view with call log and filtering
- ✅ Full theming integration
- ✅ Responsive design
- ⏸️ Keypad view (coming soon)
- ⏸️ Contacts view (coming soon)
- ⏸️ Modals for contact/call management (coming soon)

## Features

### � Home View (Call Log)

- **Call History**: View your recent calls with detailed information
- **Smart Filtering**: Filter by All, Missed, Outgoing, or Incoming calls
- **Contact Integration**: Automatically shows contact names and avatars
- **Quick Actions**: Call back, add to contacts, or block unknown numbers
- **Frequent Contacts**: Quick access to your most-called contacts
- **Beautiful Design**: Material Design-inspired UI with smooth animations

### 🔢 Keypad View (Coming Soon)

- Full numeric keypad for manual dialing
- Live dialing number display
- Quick dial integration

### 👥 Contacts View (Coming Soon)

- Browse all your quick dial contacts
- Smart grouping: Priority, A-Z, Hebrew, Numbers
- Search functionality
- Create and edit contacts

### 🚫 Blocked Numbers (Coming Soon)

- Manage blocked numbers
- Block from call history
- Easy unblock option

## Requirements

- Home Assistant 2024.1.0 or newer
- TsuryPhone integration installed and configured
- Modern browser with Web Components support

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Go to "Frontend"
3. Click the three dots menu in the top right
4. Select "Custom repositories"
5. Add `https://github.com/Tsury/ha-tsuryphone-frontend-new` and select "Lovelace" as the category
6. Click "Install"
7. Restart Home Assistant
8. Clear browser cache
9. Add the card to your dashboard

### Manual Installation

1. Download `tsuryphone-card.js` from the [latest release](https://github.com/Tsury/ha-tsuryphone-frontend-new/releases)
2. Create directory `config/www/` if it doesn't exist
3. Copy `tsuryphone-card.js` to `config/www/`
4. Add the resource to your Lovelace dashboard:
   - Go to Settings → Dashboards → Resources
   - Click "Add Resource"
   - URL: `/local/tsuryphone-card.js`
   - Resource type: JavaScript Module
5. Clear browser cache
6. Add the card to your dashboard

## Configuration

### Basic Configuration

Add the card to your dashboard:

```yaml
type: custom:tsuryphone-card
entity: binary_sensor.tsuryphone_connection
```

### Advanced Configuration

```yaml
type: custom:tsuryphone-card
entity: binary_sensor.tsuryphone_connection
name: "My Phone"
theme_mode: "auto"
```

### Configuration Options

| Option                            | Type    | Default      | Description                                |
| --------------------------------- | ------- | ------------ | ------------------------------------------ |
| `entity`                          | string  | **Required** | The TsuryPhone connection sensor entity ID |
| `name`                            | string  | "TsuryPhone" | Card title                                 |
| `theme_mode`                      | string  | "auto"       | Theme mode: "auto", "light", or "dark"     |
| `show_frequent_contacts`          | boolean | `true`       | Show frequent contacts on home screen      |
| `frequent_contacts_refresh_hours` | number  | `24`         | Hours between frequent contacts refresh    |

## Development

### Setup

```bash
npm install
```

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Code Formatting

```bash
npm run format
```

## License

MIT

## Credits

Built with:

- [Lit](https://lit.dev/) - Modern web components
- [Home Assistant](https://www.home-assistant.io/) - Open source home automation
