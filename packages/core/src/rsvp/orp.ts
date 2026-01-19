/**
 * Calculates the Optimal Recognition Point (ORP) for a word.
 * The ORP is the position where the eye naturally focuses for fastest recognition.
 *
 * Based on research, the ORP is typically:
 * - 1-3 chars: position 1 (index 0)
 * - 4-5 chars: position 2 (index 1)
 * - 6-9 chars: position 3 (index 2)
 * - 10-13 chars: position 4 (index 3)
 * - 14+ chars: position 5 (index 4)
 */
export function calculateORP(word: string): number {
  const len = word.length;

  if (len <= 1) return 0;
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

/**
 * Calculates the delay (in milliseconds) before showing the next word.
 * Base delay is derived from WPM, with adjustments for:
 * - Word length (longer words get more time)
 * - Punctuation (end of sentence gets a pause)
 */
export function calculateDelay(word: string, wpm: number): number {
  // Base delay from WPM: 60000ms / wpm = ms per word
  const baseDelay = 60000 / wpm;

  // Length adjustment: longer words get more time
  const len = word.length;
  let lengthMultiplier = 1;
  if (len > 8) lengthMultiplier = 1.3;
  else if (len > 6) lengthMultiplier = 1.2;
  else if (len > 4) lengthMultiplier = 1.1;

  // Punctuation adjustment
  let punctuationMultiplier = 1;
  const lastChar = word[word.length - 1];

  if (['.', '!', '?'].includes(lastChar)) {
    // End of sentence - significant pause
    punctuationMultiplier = 2.0;
  } else if ([',', ';', ':'].includes(lastChar)) {
    // Mid-sentence pause
    punctuationMultiplier = 1.5;
  } else if (['"', "'", ')'].includes(lastChar)) {
    // Closing quote/paren - slight pause
    punctuationMultiplier = 1.2;
  }

  return Math.round(baseDelay * lengthMultiplier * punctuationMultiplier);
}

/**
 * Splits a word into three parts for ORP display:
 * - before: characters before the ORP
 * - orp: the ORP character (to be highlighted)
 * - after: characters after the ORP
 */
export function splitWordByORP(word: string): { before: string; orp: string; after: string } {
  const orpIndex = calculateORP(word);

  return {
    before: word.slice(0, orpIndex),
    orp: word[orpIndex] || '',
    after: word.slice(orpIndex + 1),
  };
}
