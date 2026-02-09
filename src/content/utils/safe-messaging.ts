// Check if extension context is still valid
export function isContextValid(): boolean {
  try {
    return !!chrome.runtime?.id
  } catch {
    return false
  }
}

// Safe sendMessage that silently handles context invalidation errors
export function safeSendMessage(message: unknown): void {
  if (!isContextValid()) {
    return
  }

  chrome.runtime.sendMessage(message).catch((err) => {
    // Silently ignore expected errors when extension is updated or reloaded
    if (err.message?.includes('Extension context invalidated') ||
        err.message?.includes('Receiving end does not exist')) {
      return
    }
    // Suppress unexpected errors in production
  })
}
