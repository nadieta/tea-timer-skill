# TEA Timer Alexa Skill

An Alexa Skill for Echo Show devices that helps with time awareness through customizable visual displays and audio notifications.

In Spanish speaking countries, TEA is the acronym for ASD. Neurodivergent folks can sometimes struggle to keep a reference of time and transition trough activities. I created this tool to help my daughter keep track of time through images and enable her to be more autonomous while anticipating change.

## Features

- Set visual timers from 1 to 60 minutes
- Pause, resume, and cancel timers
- Continuous on-screen countdown plus progress image
- Choose from three visual display types (hourglass, progress bar, or teacup)
- Customize alarm notification modes (sound, visual, or both)
- Responsive pixel art displays that animate as time progresses
- Digital countdown in MM:SS format
- Persistent user preferences between sessions

## Display Types

The skill offers three different visual experiences:

1. **Teacup** - A pixel art teacup that gradually fills with tea as time progresses
2. **Hourglass** - A traditional hourglass where sand flows from top to bottom
3. **Progress Bar** - A simple linear progress indicator

## Usage Examples

- "Alexa, ask tea timer to start a timer for 5 minutes"
- "Alexa, ask tea timer to pause the timer"
- "Alexa, ask tea timer to resume the timer"
- "Alexa, ask tea timer to cancel the timer"
- "Alexa, ask tea timer to change display to hourglass"
- "Alexa, ask tea timer to set alarm mode to visual only"
- "Alexa, ask tea timer how much time is left"

## Project Structure

- `/lambda` - AWS Lambda function code for the skill backend
- `/lambda/utils` - Utility functions, constants, and display templates
- `/models` - Voice interaction models for different languages
- `/skill-package` - Skill manifest and assets for submission
- `/skill-package/assets/images` - Skill icons for the Alexa Skill Store

## Development Setup

### Prerequisites

- Node.js 14.x or higher
- npm (Node Package Manager)
- An Amazon Developer account
- AWS account with Lambda permissions
- ASK CLI (Alexa Skills Kit Command Line Interface)

### Local Development

1. Clone this repository:
```bash
git clone https://github.com/yourusername/tea-timer-skill.git
cd tea-timer-skill
```

2. Install dependencies:
```bash
cd lambda
npm install
cd ..
```

3. Test the skill locally:
```bash
cd lambda
npm test
```

## Deployment

### Using the Deployment Scripts

The project includes two deployment scripts:

1. **Quick Deploy (for updates to existing skill):**
```bash
chmod +x deploy.sh
./deploy.sh
```

2. **First-Time Setup and Deploy:**
```bash
chmod +x setup-and-deploy.sh
./setup-and-deploy.sh
```
This script will:
- Install the ASK CLI if needed
- Guide you through AWS authentication
- Update configuration files with your Lambda ARN if you have an existing function
- Deploy both the interaction model and Lambda code

### Manual Deployment

1. Install the ASK CLI:
```bash
npm install -g ask-cli
ask init
```

2. Deploy the skill:
```bash
ask deploy
```

## Testing

The Lambda directory includes several test scripts:

```bash
# Test basic launch
npm test

# Test specific intents
npm run test:start
npm run test:pause
npm run test:check
npm run test:display
```

## Troubleshooting

- **ASK CLI Authentication Issues**: Ensure you've completed the authentication process with `ask init`
- **Lambda Deployment Failures**: Check that your AWS credentials are properly configured
- **Skill Not Responding**: Verify the Lambda function has the correct permissions for the Alexa Skills Kit trigger
- **Missing Visual Elements**: Ensure your Echo device supports APL (Alexa Presentation Language)

## License

ISC License 