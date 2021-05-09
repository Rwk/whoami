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
const helpText = `
Liste des commandes disponibles : 

aide - Affiche la liste des commandes disponibles
contact - Affiche les informations de contact
`

const contactInfo = {
  email: 'raphael.deschler@gmail.com',
  github: 'https://github.com/Rwk',
  facebook: 'https://www.facebook.com/RwkZeJedi'
}

const contactList = Object.keys(contactInfo)
  .reduce((result, key) => result.concat([`${key} - ${contactInfo[key]}`]), [])
  .join('\n');

const contactText = `

${contactList}
Use ex. 'contact github' to open the links.
`;

const openContact = key => window.open(key === 'email'
  ? `mailto:${contactInfo[key]}`
  : contactInfo[key]);

// Commands
const commands = {
  aide: () => helpText,
  contact: (key) => {
    if (key in contactInfo) {
      openContact(key);
      return `Ouverture - ${key} - ${contactInfo[key]}`;
    }

    return contactText;
  }
}

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

// Parses input
const parser = onparsed => str => {
  if (str.length) {
    const args = str.split(' ').map(s => s.trim())
    const cmd = args.splice(0, 1)[0]
    console.debug(cmd, args)
    onparsed(cmd, ...args)
  }
}

// Execute commands
const executor = commands => (cmd, ...args) => cb => {
  try {
    commands[cmd]
      ? cb(commands[cmd](...args) + '\n')
      : cb(`No such command '${cmd}'\n`)
  } catch (e) {
    console.warn(e)
    cb(`Exception: ${e}\n`)
  }
}

// Handle keyboard events
const keyboard = (parse) => {
  let input = []
  const keys = {8: 'backspace', 13: 'enter'}
  const ignoreKey = code => code >= 33 && code <= 40
  const key = ev => keys[ev.which || ev.keyCode]

  return {
    keypress: (ev) => {
      if (key(ev) === 'enter') {
        const str = input.join('').trim()
        parse(str)
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
const terminal = (banner, buflen, tickrate, prompt, commands) => {
    let buffer = [] // What will be displayed
    let busy = false // If we cannot type at the moment

    const $root = document.querySelector('#terminal')
    const $element = createElement($root)

    const output = (output) => {
        let append = output + '\n' + prompt()
        buffer = buffer.concat(append.split(''))
    }

    const print = printer($element, buflen)
    const execute = executor(commands)
    const onrender = () => (busy = print(buffer))
    const onparsed = (cmd, ...args) => execute(cmd, ...args)(output)
    const render = renderer(tickrate, onrender)
    const parse = parser(onparsed)
    const focus = () => setTimeout(() => $element.focus(), 1)
    const kbd = keyboard(parse)
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
      parse,
      print: output
    }
}

// Onload
const load = () => {
    const t = terminal(banner, buflen, tickrate, prompt, commands)
}

document.addEventListener('DOMContentLoaded', load)