# Assets Setup Instructions

## Icon (assets/icon.png)

You need a 128x128 PNG icon for the extension. Options:

1. **Use a placeholder**: Download any 128x128 PNG and name it `icon.png`
2. **Create your own**: Use a design tool to create an alarm clock icon
3. **Free icons**: Download from sites like:
   - https://www.iconfinder.com
   - https://icons8.com
   - https://www.flaticon.com

The icon should be visible on both light and dark backgrounds.

## Sound Files (assets/sounds/)

Create or download MP3 sound files:

1. **default.mp3** - Default alarm sound (2-3 seconds)
2. **alarm1.mp3** - Alternative alarm sound
3. **timer.mp3** - Timer completion sound

For testing, you can use silent MP3 files or generate simple tones.

### Free Sound Resources:
- https://freesound.org
- https://www.zapsplat.com
- https://soundbible.com

## Quick Setup (Testing Only)

For immediate testing without sounds:

1. Create empty placeholder files:
```bash
touch assets/sounds/default.mp3
touch assets/sounds/alarm1.mp3
touch assets/sounds/timer.mp3
```

2. The extension will work but won't play sounds until real audio files are added.

3. For the icon, any 128x128 PNG will work as a placeholder.
