/**
 * Test script for Tea Timer Alexa Skill
 * 
 * This script simulates Alexa requests to test the skill locally.
 * Usage: node test.js [request_type]
 * 
 * Example: node test.js LaunchRequest
 * Example: node test.js StartTimerIntent
 */

const { handler } = require('./index');

// Mock context object
const context = {
  succeed: function(result) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  },
  fail: function(error) {
    console.error(error);
    process.exit(1);
  }
};

// Get the request type from command line args
const requestType = process.argv[2] || 'LaunchRequest';

// Base request templates
const requestTemplates = {
  LaunchRequest: {
    version: '1.0',
    session: {
      new: true,
      sessionId: 'test-session-id',
      application: {
        applicationId: 'amzn1.ask.skill.test-app-id'
      },
      user: {
        userId: 'test-user-id'
      }
    },
    context: {
      System: {
        application: {
          applicationId: 'amzn1.ask.skill.test-app-id'
        },
        user: {
          userId: 'test-user-id'
        },
        device: {
          deviceId: 'test-device-id',
          supportedInterfaces: {
            'Alexa.Presentation.APL': {}
          }
        }
      }
    },
    request: {
      type: 'LaunchRequest',
      requestId: 'test-request-id',
      timestamp: new Date().toISOString(),
      locale: 'en-US'
    }
  },
  
  StartTimerIntent: {
    version: '1.0',
    session: {
      new: false,
      sessionId: 'test-session-id',
      application: {
        applicationId: 'amzn1.ask.skill.test-app-id'
      },
      user: {
        userId: 'test-user-id'
      }
    },
    context: {
      System: {
        application: {
          applicationId: 'amzn1.ask.skill.test-app-id'
        },
        user: {
          userId: 'test-user-id'
        },
        device: {
          deviceId: 'test-device-id',
          supportedInterfaces: {
            'Alexa.Presentation.APL': {}
          }
        }
      }
    },
    request: {
      type: 'IntentRequest',
      requestId: 'test-request-id',
      timestamp: new Date().toISOString(),
      locale: 'en-US',
      intent: {
        name: 'StartTimerIntent',
        confirmationStatus: 'NONE',
        slots: {
          minutes: {
            name: 'minutes',
            value: '5',
            confirmationStatus: 'NONE'
          },
          displayType: {
            name: 'displayType',
            value: 'teacup',
            confirmationStatus: 'NONE'
          },
          alarmMode: {
            name: 'alarmMode',
            value: 'both',
            confirmationStatus: 'NONE'
          }
        }
      }
    }
  },
  
  PauseTimerIntent: {
    version: '1.0',
    session: {
      new: false,
      sessionId: 'test-session-id',
      application: {
        applicationId: 'amzn1.ask.skill.test-app-id'
      },
      user: {
        userId: 'test-user-id'
      },
      attributes: {
        timer: {
          startTime: Date.now() - 60000,
          duration: 300000,
          displayType: 'teacup',
          alarmMode: 'both',
          status: 'running'
        }
      }
    },
    context: {
      System: {
        application: {
          applicationId: 'amzn1.ask.skill.test-app-id'
        },
        user: {
          userId: 'test-user-id'
        },
        device: {
          deviceId: 'test-device-id',
          supportedInterfaces: {
            'Alexa.Presentation.APL': {}
          }
        }
      }
    },
    request: {
      type: 'IntentRequest',
      requestId: 'test-request-id',
      timestamp: new Date().toISOString(),
      locale: 'en-US',
      intent: {
        name: 'PauseTimerIntent',
        confirmationStatus: 'NONE',
        slots: {}
      }
    }
  },
  
  CheckTimerIntent: {
    version: '1.0',
    session: {
      new: false,
      sessionId: 'test-session-id',
      application: {
        applicationId: 'amzn1.ask.skill.test-app-id'
      },
      user: {
        userId: 'test-user-id'
      },
      attributes: {
        timer: {
          startTime: Date.now() - 60000,
          duration: 300000,
          displayType: 'teacup',
          alarmMode: 'both',
          status: 'running'
        }
      }
    },
    context: {
      System: {
        application: {
          applicationId: 'amzn1.ask.skill.test-app-id'
        },
        user: {
          userId: 'test-user-id'
        },
        device: {
          deviceId: 'test-device-id',
          supportedInterfaces: {
            'Alexa.Presentation.APL': {}
          }
        }
      }
    },
    request: {
      type: 'IntentRequest',
      requestId: 'test-request-id',
      timestamp: new Date().toISOString(),
      locale: 'en-US',
      intent: {
        name: 'CheckTimerIntent',
        confirmationStatus: 'NONE',
        slots: {}
      }
    }
  },
  
  ChangeDisplayIntent: {
    version: '1.0',
    session: {
      new: false,
      sessionId: 'test-session-id',
      application: {
        applicationId: 'amzn1.ask.skill.test-app-id'
      },
      user: {
        userId: 'test-user-id'
      },
      attributes: {
        timer: {
          startTime: Date.now() - 60000,
          duration: 300000,
          displayType: 'teacup',
          alarmMode: 'both',
          status: 'running'
        }
      }
    },
    context: {
      System: {
        application: {
          applicationId: 'amzn1.ask.skill.test-app-id'
        },
        user: {
          userId: 'test-user-id'
        },
        device: {
          deviceId: 'test-device-id',
          supportedInterfaces: {
            'Alexa.Presentation.APL': {}
          }
        }
      }
    },
    request: {
      type: 'IntentRequest',
      requestId: 'test-request-id',
      timestamp: new Date().toISOString(),
      locale: 'en-US',
      intent: {
        name: 'ChangeDisplayIntent',
        confirmationStatus: 'NONE',
        slots: {
          displayType: {
            name: 'displayType',
            value: 'hourglass',
            confirmationStatus: 'NONE'
          }
        }
      }
    }
  }
};

// Get the request template
const requestTemplate = requestTemplates[requestType];

if (!requestTemplate) {
  console.error(`Error: Request type "${requestType}" not found.`);
  console.log('Available request types:');
  Object.keys(requestTemplates).forEach(type => console.log(`- ${type}`));
  process.exit(1);
}

// Call the handler
console.log(`Testing ${requestType}...`);
handler(requestTemplate, context); 