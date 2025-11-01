# TsuryPhone Card

A modern, Android Pixel 8-style Phone + Contacts interface for the TsuryPhone Home Assistant integration.

## Features

### 📱 Home View (Call Log)
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

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Go to "Frontend"
3. Click the three dots menu in the top right
4. Select "Custom repositories"
5. Add this repository URL and select "Lovelace" as the category
6. Click "Install"
7. Add the card to your Lovelace dashboard

### Manual Installation

1. Download `tsuryphone-card.js` from the [latest release](https://github.com/Tsury/ha-tsuryphone-frontend-new/releases)
2. Copy it to `config/www/` in your Home Assistant installation
3. Add the resource to your Lovelace dashboard:
   - Go to Settings → Dashboards → Resources
   - Click "Add Resource"
   - URL: `/local/tsuryphone-card.js`
   - Resource type: JavaScript Module

## Configuration

Add the card to your dashboard:

```yaml
type: custom:tsuryphone-card
entity: binary_sensor.tsuryphone_connection
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | The TsuryPhone connection sensor entity ID |
| `name` | string | "TsuryPhone" | Card title |
| `theme_mode` | string | "auto" | Theme mode: "auto", "light", or "dark" |

### Example Configuration

```yaml
type: custom:tsuryphone-card
entity: binary_sensor.tsuryphone_connection
name: "My Phone"
theme_mode: "auto"
```

## Requirements

- Home Assistant 2024.1.0 or newer
- TsuryPhone integration installed and configured
- Modern browser with Web Components support

## Theming

The card automatically adapts to your Home Assistant theme, supporting both light and dark modes. All colors, spacing, and typography follow HA's design system.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Current Status

**Version**: 0.1.0-alpha

This is an early alpha release with the following features:
- ✅ Navigation system (Home, Keypad, Contacts tabs)
- ✅ Home view with call log and filtering
- ✅ Full theming integration
- ✅ Responsive design
- ⏸️ Keypad view (coming soon)
- ⏸️ Contacts view (coming soon)
- ⏸️ Modals for contact/call management (coming soon)

## Development

This project is under active development. Contributions are welcome!

### Building from Source

```bash
npm install
npm run build
```

The compiled card will be in `dist/tsuryphone-card.js`.

## Support

- **Issues**: [GitHub Issues](https://github.com/Tsury/ha-tsuryphone-frontend-new/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Tsury/ha-tsuryphone-frontend-new/discussions)

## License

MIT License - see LICENSE file for details

## Credits

Inspired by Android Pixel's Phone app design, built for the Home Assistant community.
