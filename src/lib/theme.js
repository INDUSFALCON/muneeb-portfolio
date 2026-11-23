// V1 starts in light mode; an explicit saved dark preference is preserved.
const themeKey = 'portfolio-theme-v2'
export function readTheme(storage) {
  try { return storage.getItem(themeKey) === 'dark' ? 'dark' : 'light' }
  catch { return 'light' }
}
export function saveTheme(storage, theme) {
  try { storage.setItem(themeKey, theme) } catch { /* Theme still works without storage. */ }
}
