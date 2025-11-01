# Smoke Test #1 — HACS Install & Home View Verification

Run this after creating a GitHub release and uploading the release assets, or by adding the repo to HACS as a custom repository.

## Preconditions
- Home Assistant instance running (2024.12+ recommended)
- HACS installed and configured
- TsuryPhone backend integration installed and connected to a TsuryPhone device

## Steps

1. Add repository to HACS:
   - HACS → Frontend → three-dots menu → Custom repositories → Add repository URL → category: Lovelace
2. Install `TsuryPhone Card` via HACS
3. Restart Home Assistant (if requested)
4. Add the card to a Lovelace dashboard:
   - Go to Edit Dashboard → Add Card → Custom → TsuryPhone Card
   - Provide required `entity` (e.g., `binary_sensor.tsuryphone_connection`)
5. Verify card loads with no console errors
6. Verify navigation works (Home / Keypad / Contacts)
7. On Home view:
   - Confirm call log items appear
   - Confirm filters (All, Missed, Contacts, Blocked) work
   - Test quick actions on a call log item (call back, add contact, block)
8. Theming:
   - Switch HA theme to dark and light, verify card adapts
9. Responsive:
   - Resize browser / use mobile device to verify layout

## Expected Results
- Card loads without JS errors
- Home view shows call history and filters work
- Theming and responsive behaviors are correct

## Troubleshooting
- If the card fails to load, check browser console for module/resource path errors (ensure `dist/tsuryphone-card.js` is available)
- If call data is missing, verify TsuryPhone integration is connected and publishing state

