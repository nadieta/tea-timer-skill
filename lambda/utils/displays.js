/**
 * Tea Timer Skill Display Templates
 */

const constants = require('./constants');
const utils = require('./utils');

/**
 * Gets the APL template for the welcome screen
 * @returns {Object} - APL document for welcome screen
 */
const getWelcomeScreen = () => {
  return {
    type: 'APL',
    version: '1.9',
    theme: 'dark',
    import: [
      {
        name: 'alexa-layouts',
        version: '1.5.0'
      }
    ],
    resources: [
      {
        dimensions: {
          pixelUnit: {
            value: 10,
            type: 'dp'
          }
        }
      }
    ],
    styles: {
      textStyleBase: {
        description: 'Base text style',
        values: [
          {
            color: constants.COLORS.WHITE
          }
        ]
      },
      textStyleTitle: {
        description: 'Title text style',
        extend: 'textStyleBase',
        values: [
          {
            fontSize: '48dp',
            fontWeight: 'bold'
          }
        ]
      },
      textStyleSubtitle: {
        description: 'Subtitle text style',
        extend: 'textStyleBase',
        values: [
          {
            fontSize: '32dp',
            fontStyle: 'italic'
          }
        ]
      },
      textStyleInstruction: {
        description: 'Instruction text style',
        extend: 'textStyleBase',
        values: [
          {
            fontSize: '24dp',
            color: constants.COLORS.WHITE
          }
        ]
      }
    },
    layouts: {},
    mainTemplate: {
      parameters: [
        'data'
      ],
      items: [
        {
          type: 'Container',
          width: '100%',
          height: '100%',
          direction: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          items: [
            {
              type: 'Text',
              text: '${data.title}',
              style: 'textStyleTitle',
              textAlign: 'center',
              paddingBottom: '24dp'
            },
            {
              type: 'Text',
              text: '${data.subtitle}',
              style: 'textStyleSubtitle',
              textAlign: 'center',
              paddingBottom: '48dp'
            },
            {
              type: 'Container',
              width: '80%',
              direction: 'column',
              items: [
                {
                  type: 'Sequence',
                  data: '${data.instructions}',
                  numbered: true,
                  items: [
                    {
                      type: 'Text',
                      text: '${data}',
                      style: 'textStyleInstruction',
                      paddingLeft: '16dp',
                      paddingRight: '16dp',
                      paddingBottom: '12dp'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  };
};

/**
 * Gets the APL template for the timer screen
 * @returns {Object} - APL document for timer screen
 */
const getTimerScreen = () => {
  return {
    type: 'APL',
    version: '1.9',
    theme: 'dark',
    import: [
      {
        name: 'alexa-layouts',
        version: '1.5.0'
      }
    ],
    resources: [
      {
        dimensions: {
          pixelUnit: {
            value: 10,
            type: 'dp'
          }
        }
      }
    ],
    styles: {
      textStyleBase: {
        description: 'Base text style',
        values: [
          {
            color: constants.COLORS.WHITE
          }
        ]
      },
      textStyleTimer: {
        description: 'Timer text style',
        extend: 'textStyleBase',
        values: [
          {
            fontSize: '72dp',
            fontWeight: 'bold'
          }
        ]
      },
      textStyleTimerExpired: {
        description: 'Timer expired text style',
        extend: 'textStyleTimer',
        values: [
          {
            color: constants.COLORS.RED
          }
        ]
      },
      textStyleStatus: {
        description: 'Status text style',
        extend: 'textStyleBase',
        values: [
          {
            fontSize: '24dp',
            fontStyle: 'italic',
            color: constants.COLORS.WHITE
          }
        ]
      }
    },
    layouts: {
      PixelArtLayout: {
        parameters: [
          {
            name: 'pixelData',
            type: 'array'
          },
          {
            name: 'pixelSize',
            type: 'number',
            default: 10
          }
        ],
        items: [
          {
            type: 'Container',
            direction: 'column',
            items: [
              {
                type: 'Sequence',
                scrollDirection: 'vertical',
                data: '${pixelData}',
                height: '${pixelData.length * pixelSize}',
                width: '${pixelData[0].length * pixelSize}',
                items: [
                  {
                    type: 'Container',
                    direction: 'row',
                    height: '${pixelSize}',
                    items: [
                      {
                        type: 'Sequence',
                        scrollDirection: 'horizontal',
                        data: '${data}',
                        items: [
                          {
                            type: 'Frame',
                            backgroundColor: "${data === 0 ? 'transparent' : data === 1 ? constants.COLORS.BLACK : data === 2 ? constants.COLORS.BROWN : data === 3 ? constants.COLORS.WHITE : constants.COLORS.GOLD}",
                            width: '${pixelSize}',
                            height: '${pixelSize}'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    mainTemplate: {
      parameters: [
        'data'
      ],
      items: [
        {
          type: 'Container',
          width: '100%',
          height: '100%',
          direction: 'column',
          alignItems: 'center',
          justifyContent: 'spaceBetween',
          items: [
            {
              type: 'Container',
              width: '100%',
              paddingTop: '48dp',
              alignItems: 'center',
              items: [
                {
                  type: 'Text',
                  text: '${data.timeRemaining}',
                  style: '${data.timeRemaining === "00:00" ? "textStyleTimerExpired" : "textStyleTimer"}',
                  textAlign: 'center'
                },
                {
                  when: '${data.paused}',
                  type: 'Text',
                  text: 'PAUSED',
                  style: 'textStyleStatus',
                  textAlign: 'center',
                  paddingTop: '16dp'
                }
              ]
            },
            {
              type: 'Container',
              alignItems: 'center',
              justifyContent: 'center',
              grow: 1,
              items: [
                {
                  type: 'PixelArtLayout',
                  pixelData: '${getPixelArray(data.displayType, data.stage)}',
                  pixelSize: 20
                }
              ]
            },
            {
              type: 'Container',
              width: '100%',
              paddingBottom: '48dp',
              alignItems: 'center',
              items: [
                {
                  type: 'Text',
                  text: 'TEA TIMER',
                  style: 'textStyleBase',
                  textAlign: 'center'
                }
              ]
            }
          ]
        }
      ]
    },
    onMount: [
      {
        type: 'Sequential',
        commands: [
          {
            type: 'SetValue',
            componentId: 'root',
            property: 'getPixelArray',
            value: "(displayType, stage) => { const adjustedStage = Math.min(Math.floor(stage / 10), 9); if (displayType === 'hourglass') { return generateHourglass(adjustedStage); } else if (displayType === 'progress') { return generateProgressBar(adjustedStage); } else { return generateTeacup(adjustedStage); } function generateHourglass(stage) { const hourglass = [ [1, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0], [0, 0, 1, 1, 1, 0, 0], [0, 1, 1, 1, 1, 1, 0], [1, 1, 1, 1, 1, 1, 1] ]; const result = []; for (let i = 0; i < hourglass.length; i++) { result.push([...hourglass[i]]); } for (let i = 1; i < 3; i++) { for (let j = 1; j < 6; j++) { if (stage > i * 3) { result[i][j] = 0; } } } for (let i = 5; i < 7; i++) { for (let j = 1; j < 6; j++) { if (stage >= (i - 4) * 3) { result[i][j] = 1; } else { result[i][j] = 0; } } } if (stage < 3) { result[3][3] = 1; result[4][3] = 1; } else if (stage < 6) { result[3][3] = 0; result[4][3] = 1; } else { result[3][3] = 0; result[4][3] = 0; } return result; } function generateProgressBar(stage) { const progressBar = [ [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] ]; const result = []; for (let i = 0; i < progressBar.length; i++) { result.push([...progressBar[i]]); } const fillWidth = Math.floor(stage); for (let i = 1; i < 4; i++) { for (let j = 1; j <= fillWidth; j++) { if (j < 11) { result[i][j] = 1; } } } return result; } function generateTeacup(stage) { const teacup = [ [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0], [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] ]; const result = []; for (let i = 0; i < teacup.length; i++) { result.push([...teacup[i]]); } const filledRows = Math.min(4, Math.floor(stage / 2.5)); for (let i = 9; i > 9 - filledRows; i--) { for (let j = 1; j < 10; j++) { if (result[i][j] === 1) { result[i][j] = 2; } } } if (filledRows >= 4 && stage < 9) { result[0][5] = 3; result[1][3] = 3; result[1][7] = 3; } return result; } }"
          }
        ]
      }
    ]
  };
};

module.exports = {
  getWelcomeScreen,
  getTimerScreen
}; 