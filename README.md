# Alarm & Timer - Browser Extension

A Chrome/Edge browser extension providing alarm clock and countdown timer functionality.

## Features

- ⏰ **Alarms**: Set multiple alarms with custom repeat schedules
- ⏱️ **Timers**: Multiple concurrent countdown timers with presets
- 🔔 **Notifications**: Desktop notifications and sound alerts
- 💾 **Persistent**: Your alarms and timers are saved automatically

## Installation

### Development

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `alarm-extension` folder

### Production

Download from Chrome Web Store (coming soon).

## Usage

### Setting an Alarm

1. Click the extension icon
2. Click the "+" button in the Alarms tab
3. Select the time and optional label
4. Choose repeat days (leave empty for one-time alarm)
5. Click Save

### Starting a Timer

1. Click the extension icon
2. Go to the Timers tab
3. Click a preset (1, 5, 10, or 25 minutes) or enter custom time
4. Click Start

### Settings

- Change alert sound
- Adjust volume
- Enable/disable notifications
- Test notification

## Development

### Project Structure

```
alarm-extension/
├── manifest.json          # Extension configuration
├── background/
│   └── service-worker.js  # Background alarm/timer logic
├── popup/
│   ├── popup.html         # UI structure
│   ├── popup.css          # UI styles
│   └── popup.js           # UI logic
├── utils/
│   ├── alarm.js           # Alarm helpers
│   ├── timer.js           # Timer helpers
│   └── notification.js    # Notification helpers
├── styles/
│   └── common.css         # Shared styles
└── assets/
    ├── icon.png           # Extension icon
    └── sounds/            # Alert sounds
```

### Testing

- Alarms: Set an alarm for 1-2 minutes in the future and wait
- Timers: Start a 1-minute timer and verify notification
- Permissions: Ensure notification permission is requested

## Permissions

- `alarms` - Background scheduling
- `storage` - Save alarms and timers
- `notifications` - Desktop notifications

## License

MIT
