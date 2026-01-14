export function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // If we can't access window.top due to cross-origin restrictions, assume embedded.
    return true;
  }
}
