# Tea Timer Alexa Skill

An Alexa Skill for Echo Show devices that allows you to set timers for brewing tea with visual feedback.

## Features

- Create a new timer (between 1 and 60 minutes of duration)
- Pause the timer
- Resume the timer
- Cancel the timer
- Choose alarm mode (sound + visual or visual only)
- Choose display type (hourglass, progress bar, or teacup)
- Visual pixel art display that changes as the timer progresses
- Countdown display in MM:SS format

## Display Types

The skill offers three different display types:

1. **Teacup** - A pixel art teacup that fills up as the timer progresses
2. **Hourglass** - A pixel art hourglass that empties from top to bottom
3. **Progress Bar** - A simple progress bar that fills as the timer progresses

## Usage Examples

- "Alexa, ask tea timer to start a timer for 5 minutes"
- "Alexa, ask tea timer to pause the timer"
- "Alexa, ask tea timer to resume the timer"
- "Alexa, ask tea timer to cancel the timer"
- "Alexa, ask tea timer to change display to hourglass"
- "Alexa, ask tea timer to set alarm mode to visual only"
- "Alexa, ask tea timer how much time is left"

## Project Structure

- `/lambda` - AWS Lambda function code for the skill
- `/lambda/utils` - Utility functions and constants
- `/models` - Interaction models for the skill

## Development

### Prerequisites

- Node.js 12.x or higher
- An Amazon Developer account
- AWS account for Lambda function deployment

### Setup

1. Install dependencies:
```bash
cd lambda
npm install
```

2. Deploy the skill using the ASK CLI or manually through the Alexa Developer Console.

## Implementation Notes

- The skill uses Alexa Presentation Language (APL) for visual display on Echo Show devices
- Timer persistence is managed using the S3PersistenceAdapter
- Pixel art displays are dynamically generated based on timer progress 