/** Copy only reports success when the browser clipboard promise resolves. */
export async function copyText(text, clipboard = globalThis.navigator?.clipboard) {
  if (!clipboard || typeof clipboard.writeText !== 'function') return false;
  try {
    await clipboard.writeText(String(text));
    return true;
  } catch {
    return false;
  }
}
