const Alexa = require('ask-sdk-core');
const { S3PersistenceAdapter } = require('ask-sdk-s3-persistence-adapter');
const utils = require('./utils/utils');
const constants = require('./utils/constants');
const displays = require('./utils/displays');

// Custom mock persistence adapter for testing locally
class MockPersistenceAdapter {
  constructor() {
    this.mockData = {};
  }
  
  async getAttributes(requestEnvelope) {
    return this.mockData;
  }
  
  async saveAttributes(requestEnvelope, attributes) {
    this.mockData = attributes;
    return;
  }
  
  async deleteAttributes(requestEnvelope) {
    this.mockData = {};
    return;
  }
}

// Determine if this is a test environment by checking for test session ID
const isTestEnvironment = (requestEnvelope) => {
  return requestEnvelope 
    && requestEnvelope.session 
    && requestEnvelope.session.sessionId === 'test-session-id';
};

// Create S3 persistence adapter
const s3PersistenceAdapter = new S3PersistenceAdapter({
  bucketName: process.env.S3_PERSISTENCE_BUCKET || 'tea-timer-bucket',
});

// Mock persistence adapter singleton
const mockPersistenceAdapter = new MockPersistenceAdapter();

// Get the appropriate persistence adapter based on environment
const getPersistenceAdapter = (requestEnvelope) => {
  if (isTestEnvironment(requestEnvelope)) {
    console.log('Using mock persistence adapter for testing');
    return mockPersistenceAdapter;
  } else {
    return s3PersistenceAdapter;
  }
};

// Persistence adapter for saving timer data
// Will be assigned on each request

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Welcome to Tea Timer! You can say "start a timer for 5 minutes" or ask for help.';
    
    // Add APL display for Echo Show devices
    if (utils.supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          document: displays.getWelcomeScreen(),
          datasources: {
            data: {
              title: 'TEA TIMER',
              subtitle: 'Your perfect tea companion',
              instructions: [
                'Start a timer: "Alexa, start a timer for 5 minutes"',
                'Pause a timer: "Alexa, pause the timer"',
                'Cancel a timer: "Alexa, cancel the timer"',
                'Choose display: "Alexa, show hourglass display"'
              ]
            }
          }
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
    }
  }
};

const StartTimerIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartTimerIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
    
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    
    // Get timer duration from slot
    let minutes = parseInt(slots.minutes.value, 10);
    
    if (isNaN(minutes) || minutes < 1) {
      minutes = 1;
    } else if (minutes > 60) {
      minutes = 60;
    }
    
    // Get display preference if provided, default to teacup
    let displayType = (slots.displayType && slots.displayType.value) 
      ? slots.displayType.value.toLowerCase() 
      : persistentAttributes.displayType || 'teacup';
    
    // Get alarm mode if provided, default to both
    let alarmMode = (slots.alarmMode && slots.alarmMode.value) 
      ? slots.alarmMode.value.toLowerCase() 
      : persistentAttributes.alarmMode || 'both';
    
    // Save timer information
    const timerData = {
      startTime: new Date().getTime(),
      duration: minutes * 60 * 1000, // convert to milliseconds
      displayType,
      alarmMode,
      status: 'running'
    };
    
    sessionAttributes.timer = timerData;
    persistentAttributes.displayType = displayType;
    persistentAttributes.alarmMode = alarmMode;
    
    attributesManager.setSessionAttributes(sessionAttributes);
    attributesManager.setPersistentAttributes(persistentAttributes);
    await attributesManager.savePersistentAttributes();
    
    const speakOutput = `Starting a ${minutes} minute timer with ${displayType} display.`;
    
    // Add APL display for Echo Show devices
    if (utils.supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          document: displays.getTimerScreen(),
          datasources: {
            data: {
              timeRemaining: `${minutes}:00`,
              displayType,
              stage: 0
            }
          }
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

const PauseTimerIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PauseTimerIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    
    if (!sessionAttributes.timer) {
      return handlerInput.responseBuilder
        .speak("There's no active timer to pause.")
        .getResponse();
    }
    
    const timer = sessionAttributes.timer;
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - timer.startTime;
    
    if (timer.status === 'paused') {
      return handlerInput.responseBuilder
        .speak("The timer is already paused.")
        .getResponse();
    }
    
    // Update timer status
    timer.status = 'paused';
    timer.remainingTime = timer.duration - elapsedTime;
    sessionAttributes.timer = timer;
    
    attributesManager.setSessionAttributes(sessionAttributes);
    
    const speakOutput = "Timer paused.";
    
    // Format remaining time for display
    const timeRemaining = utils.formatTime(timer.remainingTime);
    
    // Add APL display for Echo Show devices
    if (utils.supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          document: displays.getTimerScreen(),
          datasources: {
            data: {
              timeRemaining,
              displayType: timer.displayType,
              stage: Math.floor((elapsedTime / timer.duration) * 100),
              paused: true
            }
          }
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

const ResumeTimerIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResumeTimerIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    
    if (!sessionAttributes.timer) {
      return handlerInput.responseBuilder
        .speak("There's no paused timer to resume.")
        .getResponse();
    }
    
    const timer = sessionAttributes.timer;
    
    if (timer.status !== 'paused') {
      return handlerInput.responseBuilder
        .speak("The timer is already running.")
        .getResponse();
    }
    
    // Update timer status
    timer.status = 'running';
    timer.startTime = new Date().getTime();
    timer.duration = timer.remainingTime;
    delete timer.remainingTime;
    
    sessionAttributes.timer = timer;
    attributesManager.setSessionAttributes(sessionAttributes);
    
    const speakOutput = "Timer resumed.";
    
    // Format remaining time for display
    const timeRemaining = utils.formatTime(timer.duration);
    
    // Add APL display for Echo Show devices
    if (utils.supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          document: displays.getTimerScreen(),
          datasources: {
            data: {
              timeRemaining,
              displayType: timer.displayType,
              stage: 0
            }
          }
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

const CancelTimerIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CancelTimerIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    
    if (!sessionAttributes.timer) {
      return handlerInput.responseBuilder
        .speak("There's no active timer to cancel.")
        .getResponse();
    }
    
    // Clear timer data
    delete sessionAttributes.timer;
    attributesManager.setSessionAttributes(sessionAttributes);
    
    const speakOutput = "Timer cancelled.";
    
    // Add APL display for Echo Show devices
    if (utils.supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          document: displays.getWelcomeScreen(),
          datasources: {
            data: {
              title: 'TEA TIMER',
              subtitle: 'Timer cancelled',
              instructions: [
                'Start a timer: "Alexa, start a timer for 5 minutes"',
                'Pause a timer: "Alexa, pause the timer"',
                'Cancel a timer: "Alexa, cancel the timer"',
                'Choose display: "Alexa, show hourglass display"'
              ]
            }
          }
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

const ChangeDisplayIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChangeDisplayIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
    
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    
    // Get display preference
    let displayType = slots.displayType.value.toLowerCase();
    
    // Check if display type is valid
    if (!['hourglass', 'progress', 'teacup'].includes(displayType)) {
      displayType = 'teacup'; // Default
    }
    
    // Save display preference
    persistentAttributes.displayType = displayType;
    attributesManager.setPersistentAttributes(persistentAttributes);
    await attributesManager.savePersistentAttributes();
    
    // Update active timer if exists
    if (sessionAttributes.timer) {
      sessionAttributes.timer.displayType = displayType;
      attributesManager.setSessionAttributes(sessionAttributes);
      
      const timer = sessionAttributes.timer;
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - timer.startTime;
      const remainingTime = timer.duration - elapsedTime;
      
      // Format remaining time for display
      const timeRemaining = utils.formatTime(remainingTime);
      
      const speakOutput = `Display changed to ${displayType}.`;
      
      // Add APL display for Echo Show devices
      if (utils.supportsAPL(handlerInput)) {
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: displays.getTimerScreen(),
            datasources: {
              data: {
                timeRemaining,
                displayType,
                stage: Math.floor((elapsedTime / timer.duration) * 100),
                paused: timer.status === 'paused'
              }
            }
          })
          .getResponse();
      } else {
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
      }
    } else {
      const speakOutput = `Display preference set to ${displayType} for future timers.`;
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

const ChangeAlarmModeIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChangeAlarmModeIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
    const sessionAttributes = attributesManager.getSessionAttributes();
    
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    
    // Get alarm mode preference
    let alarmMode = slots.alarmMode.value.toLowerCase();
    
    // Check if alarm mode is valid
    if (!['visual', 'sound', 'both'].includes(alarmMode)) {
      alarmMode = 'both'; // Default
    }
    
    // Save alarm mode preference
    persistentAttributes.alarmMode = alarmMode;
    attributesManager.setPersistentAttributes(persistentAttributes);
    await attributesManager.savePersistentAttributes();
    
    // Update active timer if exists
    if (sessionAttributes.timer) {
      sessionAttributes.timer.alarmMode = alarmMode;
      attributesManager.setSessionAttributes(sessionAttributes);
    }
    
    let speakOutput;
    if (alarmMode === 'both') {
      speakOutput = 'Alarm mode set to sound and visual.';
    } else {
      speakOutput = `Alarm mode set to ${alarmMode} only.`;
    }
    
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

const CheckTimerIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckTimerIntent';
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    
    if (!sessionAttributes.timer) {
      return handlerInput.responseBuilder
        .speak("You don't have an active timer.")
        .getResponse();
    }
    
    const timer = sessionAttributes.timer;
    const currentTime = new Date().getTime();
    
    let remainingTime;
    if (timer.status === 'paused') {
      remainingTime = timer.remainingTime;
    } else {
      const elapsedTime = currentTime - timer.startTime;
      remainingTime = timer.duration - elapsedTime;
    }
    
    // Check if timer has completed
    if (remainingTime <= 0) {
      return handlerInput.responseBuilder
        .speak("Your timer has finished!")
        .getResponse();
    }
    
    // Convert remaining time to minutes and seconds
    const timeRemaining = utils.formatTime(remainingTime);
    const [minutes, seconds] = timeRemaining.split(':').map(num => parseInt(num, 10));
    
    let speakOutput = `You have `;
    if (minutes > 0) {
      speakOutput += `${minutes} minute${minutes > 1 ? 's' : ''} `;
      if (seconds > 0) {
        speakOutput += `and `;
      }
    }
    if (seconds > 0 || minutes === 0) {
      speakOutput += `${seconds} second${seconds > 1 ? 's' : ''} `;
    }
    speakOutput += `remaining on your timer.`;
    
    // Add APL display for Echo Show devices
    if (utils.supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          document: displays.getTimerScreen(),
          datasources: {
            data: {
              timeRemaining,
              displayType: timer.displayType,
              stage: Math.floor(((timer.duration - remainingTime) / timer.duration) * 100),
              paused: timer.status === 'paused'
            }
          }
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'You can say "start a timer for 5 minutes" to start a timer, "pause timer" to pause, ' +
      '"resume timer" to continue a paused timer, or "cancel timer" to stop it. ' +
      'You can also say "change display to hourglass" to switch between display types, ' +
      'or "set alarm mode to visual only" to choose how you\'re notified when time is up.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
            || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye!';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  }
};

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}. This intent is not supported yet.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`);
    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

// Checking timer state between requests
const TimerInterceptor = {
  async process(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    
    if (sessionAttributes.timer && sessionAttributes.timer.status === 'running') {
      const timer = sessionAttributes.timer;
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - timer.startTime;
      
      // Check if timer has completed
      if (elapsedTime >= timer.duration) {
        timer.status = 'completed';
        sessionAttributes.timer = timer;
        attributesManager.setSessionAttributes(sessionAttributes);
      }
    }
    
    return;
  }
};

// Function to create the skill handler with the right persistence adapter
exports.handler = async (event) => {
  // Select the appropriate persistence adapter based on the event
  const persistenceAdapter = getPersistenceAdapter(event);
  
  // Create the skill instance with the selected persistence adapter
  const skill = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
      LaunchRequestHandler,
      StartTimerIntentHandler,
      PauseTimerIntentHandler,
      ResumeTimerIntentHandler,
      CancelTimerIntentHandler,
      ChangeDisplayIntentHandler,
      ChangeAlarmModeIntentHandler,
      CheckTimerIntentHandler,
      HelpIntentHandler,
      CancelAndStopIntentHandler,
      SessionEndedRequestHandler,
      IntentReflectorHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(TimerInterceptor)
    .withPersistenceAdapter(persistenceAdapter)
    .create();
    
  // Handle the request
  return skill.invoke(event);
}; 