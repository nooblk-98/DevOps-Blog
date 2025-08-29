export function enhanceCodeBlocksWithCopy(root?: ParentNode) {
  const scope: ParentNode = root || document
  const codeBlocks = scope.querySelectorAll<HTMLPreElement>('pre')
  codeBlocks.forEach(pre => {
    if (pre.parentElement?.classList.contains('code-block-wrapper')) return
    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper relative'
    pre.parentNode?.insertBefore(wrapper, pre)
    wrapper.appendChild(pre)

    const code = pre.querySelector('code')
    if (!code) return
    const button = document.createElement('button')
    button.className = 'copy-code-button absolute top-2 right-2 p-1.5 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors z-10'
    button.setAttribute('aria-label', 'Copy code to clipboard')
    const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`
    const checkIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    button.innerHTML = copyIconSVG
    button.addEventListener('click', () => {
      const text = code.innerText
      const onSuccess = () => {
        button.innerHTML = checkIconSVG
        setTimeout(() => { button.innerHTML = copyIconSVG }, 1500)
      }
      // Prefer modern API on secure contexts
      if (navigator.clipboard && (window.isSecureContext || location.hostname === 'localhost')) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess))
      } else {
        fallbackCopy(text, onSuccess)
      }
    })
    wrapper.appendChild(button)
  })
}

function fallbackCopy(text: string, onSuccess: () => void) {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    if (ok) onSuccess()
  } catch {
    // noop
  }
}
