const { scenario, hover, focus } = require('../scenarioHelper');

module.exports = [
  // Date picker types
  scenario('Type Date', {
    selectors: ['#demo-date'],
  }),
  scenario('Type Date with year skipping buttons', {
    selectors: ['#demo-date-year-skipping'],
  }),
  scenario('Type Date & Time', {
    selectors: ['#demo-date-and-time'],
  }),
  scenario('Type Date & Time 24 hour format', {
    selectors: ['#demo-date-and-time-24h'],
  }),

  // Hover states
  //// Date
  scenario('State hover date', {
    actions: [hover('#test-date')],
    selectors: ['#demo-date'],
  }),
  scenario('State hover time', {
    actions: [hover('#test-time')],
    selectors: ['#demo-date-and-time'],
  }),

  // Focus states
  //// Date
  scenario('State focus date', {
    actions: [focus('#test-date')],
    selectors: ['#demo-date'],
  }),
  scenario('State focus time', {
    actions: [focus('#test-time')],
    selectors: ['#demo-date-and-time'],
  }),
];