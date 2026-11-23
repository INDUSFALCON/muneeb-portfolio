export function isAdminPreview() {
  return new URLSearchParams(window.location.search).get('preview') === 'admin'
}
export function previewHref(path) {
  if (!isAdminPreview()) return path
  const [pathname, hash] = path.split('#')
  return `${pathname}?preview=admin${hash ? `#${hash}` : ''}`
}
