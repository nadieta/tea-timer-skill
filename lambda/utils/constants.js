/**
 * Tea Timer Skill Constants
 */

// Skill constants
const SKILL_NAME = 'Tea Timer';
const DEFAULT_TIMER_DURATION = 5; // minutes
const MIN_TIMER_DURATION = 1; // minutes
const MAX_TIMER_DURATION = 60; // minutes

// Display constants
const DEFAULT_DISPLAY_TYPE = 'teacup';
const VALID_DISPLAY_TYPES = ['teacup', 'hourglass', 'progress'];

// Alarm mode constants
const DEFAULT_ALARM_MODE = 'both';
const VALID_ALARM_MODES = ['visual', 'sound', 'both'];

// Timer status constants
const TIMER_STATUS = {
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed'
};

// Colors
const COLORS = {
  WHITE: '#FFFFFF',
  RED: '#FF0000',
  BLACK: '#000000',
  GREEN: '#2BAE66',
  BLUE: '#87CEEB',
  BROWN: '#8B4513',
  GOLD: '#FFD700'
};

// Pixel mapping to colors
const PIXEL_COLORS = {
  0: 'transparent', // Empty/transparent
  1: COLORS.BLACK,  // Standard pixel (outline, structure)
  2: COLORS.BROWN,  // Tea pixels
  3: COLORS.WHITE,  // Steam pixels
  4: COLORS.GOLD    // Special highlight
};

module.exports = {
  SKILL_NAME,
  DEFAULT_TIMER_DURATION,
  MIN_TIMER_DURATION,
  MAX_TIMER_DURATION,
  DEFAULT_DISPLAY_TYPE,
  VALID_DISPLAY_TYPES,
  DEFAULT_ALARM_MODE,
  VALID_ALARM_MODES,
  TIMER_STATUS,
  COLORS,
  PIXEL_COLORS
}; 