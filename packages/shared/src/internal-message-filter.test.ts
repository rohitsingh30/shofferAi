import { describe, it, expect } from 'vitest';
import { isInternalToolLabel, isAgentNarration, shouldSuppressMessage } from './internal-message-filter';

describe('isInternalToolLabel', () => {
  it('filters "Browser: <toolname>" labels', () => {
    expect(isInternalToolLabel('Browser: report_intent')).toBe(true);
    expect(isInternalToolLabel('Browser: playwright-browser_navigate')).toBe(true);
    expect(isInternalToolLabel('Browser: browser_snapshot')).toBe(true);
    expect(isInternalToolLabel('Browser: browser_click')).toBe(true);
    expect(isInternalToolLabel('Browser: some-unknown-tool')).toBe(true);
  });

  it('filters raw tool names', () => {
    expect(isInternalToolLabel('browser_navigate')).toBe(true);
    expect(isInternalToolLabel('browser_snapshot')).toBe(true);
    expect(isInternalToolLabel('browser_click')).toBe(true);
    expect(isInternalToolLabel('mcp__playwright__browser_navigate')).toBe(true);
    expect(isInternalToolLabel('playwright__browser_type')).toBe(true);
    expect(isInternalToolLabel('report_intent')).toBe(true);
  });

  it('filters status labels', () => {
    expect(isInternalToolLabel('Agent starting...')).toBe(true);
    expect(isInternalToolLabel('Starting...')).toBe(true);
    expect(isInternalToolLabel('Thinking...')).toBe(true);
  });

  it('filters empty/undefined messages', () => {
    expect(isInternalToolLabel(undefined)).toBe(true);
    expect(isInternalToolLabel('')).toBe(true);
    expect(isInternalToolLabel('   ')).toBe(true);
  });

  it('allows natural language messages through', () => {
    expect(isInternalToolLabel('I found 3 hotels under ₹4000/night')).toBe(false);
    expect(isInternalToolLabel('Your order has been placed successfully!')).toBe(false);
    expect(isInternalToolLabel('Browser is loading the page, please wait...')).toBe(false);
  });

  it('allows multi-word messages with "Browser" in them', () => {
    expect(isInternalToolLabel('Browser is ready')).toBe(false);
    expect(isInternalToolLabel('The browser has loaded the page')).toBe(false);
  });
});

describe('isAgentNarration', () => {
  it('filters observational narration ("I can see...", "I notice...")', () => {
    expect(isAgentNarration('I can see Blinkit is loaded and logged in')).toBe(true);
    expect(isAgentNarration('I can see the location change modal with saved addresses')).toBe(true);
    expect(isAgentNarration('I can see the search results')).toBe(true);
    expect(isAgentNarration('I see one saved address on ISB Road')).toBe(true);
    expect(isAgentNarration('I notice the delivery address is different')).toBe(true);
    expect(isAgentNarration("I'm seeing the products list now")).toBe(true);
    expect(isAgentNarration("I'm looking at the search results")).toBe(true);
  });

  it('filters page/element observations', () => {
    expect(isAgentNarration('The page shows the grocery categories')).toBe(true);
    expect(isAgentNarration('The location is now set to ISB Road')).toBe(true);
    expect(isAgentNarration('The search results show 5 items')).toBe(true);
    expect(isAgentNarration('The modal has opened with address options')).toBe(true);
    expect(isAgentNarration('The delivery address has been updated')).toBe(true);
  });

  it('filters action narration ("Let me...", "I\'ll...")', () => {
    expect(isAgentNarration('Let me update the location first')).toBe(true);
    expect(isAgentNarration("Let me search for the exact address")).toBe(true);
    expect(isAgentNarration("I'll click on the search result")).toBe(true);
    expect(isAgentNarration("I'll navigate to blinkit.com")).toBe(true);
    expect(isAgentNarration("Now let me search for dal")).toBe(true);
    expect(isAgentNarration("I need to change it to ISB Road")).toBe(true);
    expect(isAgentNarration("I'm going to click on the address")).toBe(true);
    expect(isAgentNarration('Searching for dal options on the page')).toBe(true);
  });

  it('filters status narration', () => {
    expect(isAgentNarration('Location is now set to ISB Road, Gachibowli with 22 minutes delivery')).toBe(true);
    expect(isAgentNarration("I've successfully updated the delivery address")).toBe(true);
    expect(isAgentNarration("I've clicked on the search button")).toBe(true);
    expect(isAgentNarration('Now the page shows dal options')).toBe(true);
  });

  it('filters third-person references to "the user"', () => {
    expect(isAgentNarration('but the user wants Main Building, ISB Road')).toBe(true);
    expect(isAgentNarration("the user's requested area matches this result")).toBe(true);
    expect(isAgentNarration('the user asked for toor dal')).toBe(true);
  });

  it('filters browser element descriptions', () => {
    expect(isAgentNarration('The modal is displaying saved addresses')).toBe(true);
    expect(isAgentNarration('The popup has opened with location options')).toBe(true);
    expect(isAgentNarration('The search bar is visible at the top')).toBe(true);
  });

  it('filters "there is/are" observations', () => {
    expect(isAgentNarration("There's ISB Road, Gachibowli, Hyderabad in the search results")).toBe(true);
    expect(isAgentNarration('There are 5 dal options available')).toBe(true);
    expect(isAgentNarration('There is a saved address matching the area')).toBe(true);
  });

  it('filters raw browser instructions', () => {
    expect(isAgentNarration('Open a new tab for blinkit.com')).toBe(true);
    expect(isAgentNarration('Navigate to https://blinkit.com')).toBe(true);
    expect(isAgentNarration('Scroll down to see more results')).toBe(true);
    expect(isAgentNarration('Click on the first search result')).toBe(true);
    expect(isAgentNarration('Wait for the page to load')).toBe(true);
  });

  it('allows legitimate user-facing messages through', () => {
    expect(isAgentNarration('Here are the dal options I found for you')).toBe(false);
    expect(isAgentNarration('Your order has been placed! Order ID: #12345')).toBe(false);
    expect(isAgentNarration('The total comes to ₹145. Would you like to proceed?')).toBe(false);
    expect(isAgentNarration('Toor Dal 1kg is currently out of stock')).toBe(false);
    expect(isAgentNarration('Which type of dal would you prefer?')).toBe(false);
    expect(isAgentNarration('Added Toor Dal 1kg (₹89) to your cart')).toBe(false);
  });

  it('handles empty/undefined', () => {
    expect(isAgentNarration(undefined)).toBe(true);
    expect(isAgentNarration('')).toBe(true);
  });
});

describe('shouldSuppressMessage', () => {
  it('suppresses tool labels', () => {
    expect(shouldSuppressMessage('Browser: browser_click')).toBe(true);
    expect(shouldSuppressMessage('report_intent')).toBe(true);
  });

  it('suppresses narration', () => {
    expect(shouldSuppressMessage('I can see the page has loaded')).toBe(true);
    expect(shouldSuppressMessage('Let me click on the search button')).toBe(true);
  });

  it('suppresses the exact messages from the user complaint', () => {
    expect(shouldSuppressMessage(
      'I can see Blinkit is loaded and logged in. The current delivery address is in Nallagandla, Hyderabad — I need to change it to ISB Road, K.V.Rangareddy. Let me update the location first.'
    )).toBe(true);
    expect(shouldSuppressMessage(
      'I can see the location change modal with saved addresses. I see one saved address on ISB Road (Prestige High Fields), but the user wants "Main Building, ISB Road". Let me search for the exact address.'
    )).toBe(true);
    expect(shouldSuppressMessage(
      'I can see the search results. There\'s "ISB Road, Gachibowli, Hyderabad, Rangareddy, Telangana, India" which matches the user\'s requested area. Let me click it.'
    )).toBe(true);
    expect(shouldSuppressMessage(
      'Location is now set to ISB Road, Gachibowli with 22 minutes delivery. Now let me search for dal.'
    )).toBe(true);
  });

  it('allows legitimate messages through', () => {
    expect(shouldSuppressMessage('Here are 5 dal options from Blinkit')).toBe(false);
    expect(shouldSuppressMessage('Your order has been placed!')).toBe(false);
    expect(shouldSuppressMessage('Which variant would you like?')).toBe(false);
  });
});
