# RowMaster Metronome

A precision rowing metronome for athletes to master their stroke-per-minute (SPM) targets with customizable sounds and haptic feedback.

## Features

- **Precise SPM Control**: Select from 18 to 36 strokes per minute (common rowing cadences)
- **Customizable Sounds**: Choose between beep, click, or wood block metronome sounds
- **Haptic Feedback**: Vibration support on mobile devices for silent training
- **Visual Beat Indicator**: Animated feedback synchronized with each stroke
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Motion (for animations)

## Development

### Prerequisites

- Node.js 20+

### Setup

```bash
npm install
```

### Run locally

```bash
npm run dev
```

App runs at http://localhost:3000

### Build

```bash
npm run build
```

## Docker

Build and run with Docker:

```bash
docker build -t rowmaster-metronome .
docker run -p 8080:3000 rowmaster-metronome
```

## License

Apache-2.0
