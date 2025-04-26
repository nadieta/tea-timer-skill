/**
 * Tea Timer Skill Utility Functions
 */

/**
 * Checks if the device supports APL (Alexa Presentation Language)
 * @param {Object} handlerInput - The handler input object
 * @returns {boolean} - Whether the device supports APL
 */
const supportsAPL = (handlerInput) => {
  const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
  return supportedInterfaces['Alexa.Presentation.APL'] !== undefined;
};

/**
 * Formats a time in milliseconds to a MM:SS string
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} - Formatted time string (MM:SS)
 */
const formatTime = (milliseconds) => {
  if (milliseconds <= 0) {
    return '00:00';
  }
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Gets the pixel art pattern for the specified display type
 * @param {string} displayType - The type of display (hourglass, progress, teacup)
 * @param {number} stage - The stage of completion (0-100)
 * @returns {Array} - 2D array representing pixel art
 */
const getPixelArt = (displayType, stage) => {
  // Convert stage to a 0-9 scale for simpler pixel art templates
  const adjustedStage = Math.min(Math.floor(stage / 10), 9);
  
  switch (displayType) {
    case 'hourglass':
      return getHourglassPixels(adjustedStage);
    case 'progress':
      return getProgressBarPixels(adjustedStage);
    case 'teacup':
    default:
      return getTeacupPixels(adjustedStage);
  }
};

/**
 * Gets the hourglass pixel art for a specific stage
 * @param {number} stage - The stage of completion (0-9)
 * @returns {Array} - 2D array representing hourglass pixel art
 */
const getHourglassPixels = (stage) => {
  // Define basic hourglass template
  const hourglass = [
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1]
  ];
  
  // Clone the hourglass template
  const pixelArt = JSON.parse(JSON.stringify(hourglass));
  
  // Adjust the hourglass based on the stage
  // For stage 0, the sand is all in the top half
  // For stage 9, the sand is all in the bottom half
  
  // Clear the sand in the top half based on stage
  for (let i = 1; i < 3; i++) {
    for (let j = 1; j < 6; j++) {
      if (stage > i * 3) {
        pixelArt[i][j] = 0;
      }
    }
  }
  
  // Fill the sand in the bottom half based on stage
  for (let i = 5; i < 7; i++) {
    for (let j = 1; j < 6; j++) {
      if (stage >= (i - 4) * 3) {
        pixelArt[i][j] = 1;
      } else {
        pixelArt[i][j] = 0;
      }
    }
  }
  
  // Middle part based on stage
  if (stage < 3) {
    // Full middle
    pixelArt[3][3] = 1;
    pixelArt[4][3] = 1;
  } else if (stage < 6) {
    // Half middle
    pixelArt[3][3] = 0;
    pixelArt[4][3] = 1;
  } else {
    // Empty middle
    pixelArt[3][3] = 0;
    pixelArt[4][3] = 0;
  }
  
  return pixelArt;
};

/**
 * Gets the progress bar pixel art for a specific stage
 * @param {number} stage - The stage of completion (0-9)
 * @returns {Array} - 2D array representing progress bar pixel art
 */
const getProgressBarPixels = (stage) => {
  // Create an empty progress bar
  const progressBar = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];
  
  // Fill the progress bar based on stage
  const fillWidth = Math.floor(stage);
  
  for (let i = 1; i < 4; i++) {
    for (let j = 1; j <= fillWidth; j++) {
      if (j < 11) { // Ensure we stay within bounds
        progressBar[i][j] = 1;
      }
    }
  }
  
  return progressBar;
};

/**
 * Gets the teacup pixel art for a specific stage
 * @param {number} stage - The stage of completion (0-9)
 * @returns {Array} - 2D array representing teacup pixel art
 */
const getTeacupPixels = (stage) => {
  // Define teacup template
  const teacup = [
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];
  
  // Clone the teacup template
  const pixelArt = JSON.parse(JSON.stringify(teacup));
  
  // The more time passed, the more tea is shown in the cup
  // Calculate how many rows to fill with tea
  const filledRows = Math.min(4, Math.floor(stage / 2.5));
  
  // Fill the teacup with tea from bottom to top
  for (let i = 9; i > 9 - filledRows; i--) {
    for (let j = 1; j < 10; j++) {
      if (pixelArt[i][j] === 1) {
        // Change color to tea (2 represents tea pixels)
        pixelArt[i][j] = 2;
      }
    }
  }
  
  // Add steam if the cup is full and stage is not 9 (finished)
  if (filledRows >= 4 && stage < 9) {
    pixelArt[0][5] = 3; // Steam pixel
    pixelArt[1][3] = 3; // Steam pixel
    pixelArt[1][7] = 3; // Steam pixel
  }
  
  return pixelArt;
};

module.exports = {
  supportsAPL,
  formatTime,
  getPixelArt,
  getHourglassPixels,
  getProgressBarPixels,
  getTeacupPixels
}; 