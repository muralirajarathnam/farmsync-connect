export function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // If accessing window.top throws due to cross-origin restrictions, we're embedded.
    return true;
  }
}
