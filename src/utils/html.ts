export function createElementFromHTML(string: string): Node {
  const div = document.createElement('div')
  div.innerHTML = string.trim()

  return div.firstChild ?? div
}
