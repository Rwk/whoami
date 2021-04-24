// Textarea
const createElement = root => {
    const el = document.createElement('textarea')
    el.contentEditable = true
    el.spellcheck = false
    el.value = ''

    root.appendChild(el)

    return el
}

// Terminal
const terminal = () => {
    const $root = document.querySelector('#terminal')
    const $element = createElement($root)
    $root.appendChild($element)
}

// Onload
const load = () => {
    const t = terminal()
}

document.addEventListener('DOMContentLoaded', load)