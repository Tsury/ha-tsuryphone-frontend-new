# Changelog

All notable changes to TsuryPhone Card will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0-alpha] - 2025-11-01

### Added

- Initial alpha release
- Bottom navigation with three tabs (Home, Keypad, Contacts)
- Home view with call log display
- Call log filtering (All, Missed, Outgoing, Incoming)
- Call history integration with TsuryPhone coordinator
- Avatar generation for contacts
- Date/time formatting for call entries
- Frequent contacts section
- Quick actions (call back, add contact, block number)
- Full Home Assistant theme integration (light/dark mode)
- Responsive design for mobile, tablet, and desktop
- WebSocket state subscriptions
- Error handling and connection management
- Cached data management (contacts, blocked, call history, priority)
- Automatic call modal triggering based on phone state

### Known Limitations

- Keypad view not yet implemented
- Contacts view not yet implemented
- Contact creation/editing modals not yet implemented
- Call modal not yet implemented
- Block number modal not yet implemented

### Requirements

- Home Assistant 2024.1.0 or newer
- TsuryPhone integration installed and configured
- Modern browser with Web Components support

[Unreleased]: https://github.com/Tsury/ha-tsuryphone-frontend-new/compare/v0.1.0-alpha...HEAD
[0.1.0-alpha]: https://github.com/Tsury/ha-tsuryphone-frontend-new/releases/tag/v0.1.0-alpha
