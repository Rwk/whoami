// Vars
const banner = `
Initialisation du terminal ...
Chargement du profil : Raphaël Deschler ...
...
Vous êtes maintenant connecté ...
Tapez "aide" pour vous les commandes disponibles ...
`
const buflen = 8
const tickrate = 1000 / 60
const prompt = () => '$ > '

// Textarea
const createElement = root => {
    const el = document.createElement('textarea')
    el.contentEditable = true
    el.spellcheck = false
    el.value = ''
    el.autofocus = true

    root.appendChild(el)

    return el
}

// Sets text selection range - if statement for browser compatibility.
const setSelectionRange = input => {
  const length = input.value.length

  if (input.setSelectionRange) { // OTHERS
    input.focus()
    input.setSelectionRange(length, length)
  } else if (input.createTextRange) { // IE
    const range = input.createTextRange()
    range.collapse(true)
    range.moveEnd('character', length)
    range.moveStart('character', length)
    range.select()
  }
}

// Creates the rendering loop
const renderer = (tickrate, onrender) => {
    let lastTick = 0

    const tick = (time) => {
      const now = performance.now()
      const delta = now - lastTick

      if (delta > tickrate) {
        lastTick = now - (delta % tickrate)

        onrender()
      }

      window.requestAnimationFrame(tick)
    }

    return tick
}

// Handle keyboard events
const keyboard = () => {
  let input = []
  const keys = {8: 'backspace', 13: 'enter'}
  const ignoreKey = code => code >= 33 && code <= 40
  const key = ev => keys[ev.which || ev.keyCode]

  return {
    keypress: (ev) => {
      if (key(ev) === 'enter') {
        const str = input.join('').trim()
        input = []
      } else if (key(ev) !== 'backspace') {
        input.push(String.fromCharCode(ev.which || ev.keyCode))
      }
    },

    keydown: (ev) => {
      if (key(ev) === 'backspace') {
        if (input.length > 0) {
          input.pop()
        } else {
          ev.preventDefault()
        }
      } else if (ignoreKey(ev.keyCode)) {
        ev.preventDefault()
      }
    }
  }
}

// Printer
const printer = ($element, buflen) => buffer => {
    if (buffer.length > 0) {
      const len = Math.min(buflen, buffer.length)
      const val = buffer.splice(0, len)

      $element.value += val.join('')
      $element.scrollTop = $element.scrollHeight

      return true
    }

    return false
}

// Terminal
const terminal = (banner, buflen, tickrate, prompt) => {
    let buffer = [] // What will be displayed
    let busy = false // If we cannot type at the moment

    const $root = document.querySelector('#terminal')
    const $element = createElement($root)

    const output = (output) => {
        let append = output + '\n' + prompt()
        buffer = buffer.concat(append.split(''))
    }

    const print = printer($element, buflen)
    const onrender = () => (busy = print(buffer))
    const render = renderer(tickrate, onrender)
    const focus = () => setTimeout(() => $element.focus(), 1)
    const kbd = keyboard()
    const input = ev => busy
    ? ev.preventDefault()
    : kbd[ev.type](ev)

    // Events
    $element.addEventListener('focus', () => setSelectionRange($element))
    $element.addEventListener('blur', focus)
    window.addEventListener('focus', focus)
    $root.addEventListener('click', focus)
    $element.addEventListener('keypress', input)
    $element.addEventListener('keydown', input)
    $root.appendChild($element)

    render()
    output(banner)

    return {
      focus,
      print: output
    }
}

// Onload
const load = () => {
    const t = terminal(banner, buflen, tickrate, prompt)
}

document.addEventListener('DOMContentLoaded', load)