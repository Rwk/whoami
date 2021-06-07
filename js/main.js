// Vars
const banner = `
Initializing the terminal ...
Loading profile : Raphaël Deschler ...
...
🆆🅴🅻🅲🅾🅼🅴
...
You are now connected ...
Enter "help" to see the list of available commands
`
const buflen = 8
const tickrate = 1000 / 60
const prompt = () => '$ > '
const helpText = `
Available commands : 

cat <filename> - Lists file contents
cd <dir> - Enters directory
clear - Clears the display
contact - Displays the contact list
contact <key> - Opens the contact link
help - Displays the list of available commands
ls - Lists files
pwd - Lists current directory
`

const contactInfo = {
  email: 'raphael.deschler@gmail.com',
  github: 'https://github.com/Rwk',
  facebook: 'https://www.facebook.com/RwkZeJedi'
}

const contactList = Object.keys(contactInfo)
  .reduce((result, key) => result.concat([`${key} - ${contactInfo[key]}`]), [])
  .join('\n')

const contactText = `

${contactList}
Use ex. 'contact github' to open the links.
`

const openContact = key => window.open(key === 'email'
  ? `mailto:${contactInfo[key]}`
  : contactInfo[key])

// File browser
const browser = (function() {
  let current = '/'

  let tree = [{
    location: '/',
    filename: 'SKILLS',
    type: 'file',
    content: `
      Product Owner - 3 years
      - Agility & Scrum
      - Making incredible roadmaps
      - PSD2, Open Banking, STET, Berlin Group
      - JIRA, Gantt Project, Trello
      - Technical & functional specifications : UML, C4

      Fullstack Developper - 11 years
      - Front : React, jQuery
      - Back : nodeJS (Express, HAPI), PHP (Symfony, CodeIgniter)
      - CMS : Hugo, Wordpress, Prestashop

      Panda - from the beginning
      - Sweet and adorable and cute
      - Funny

      Jedi - from the beginning
      - Do or do not. There is no try.
      - Fear is the path to the dark side. Fear leads to anger. Anger leads to hate. Hate leads to suffering.
      
      Viking - from the beginning
      - Robust and builds cool stuff sometimes
      - Skål
    `
  }, {
    location: '/',
    filename: 'EXPERIENCE',
    type: 'file',
    content: `
      August 2018 - Today : Product Owner @Linxo Group
      - 2020 / 2021 : Integration of PSD2 APIs (AIS)
      - 2019 / 2020 : Infrastructure as product
      - 2018 / 2019 : Oxlin PFM-API
      
      September 2017 - August 2018 : Senior fullstack developer @Linxo
      - Oxlin PFM-API + OAuth2 server + Webviews
      - nodeJS + React

      October 2015 - September 2017 : Senior fullstack developer @Neteden/Dreamnex
      - Payment platform
      - Dating platform engine
      - Symfony 1.4 / 2 / 3 + Angular JS + jQuery + nodeJS + Elastic Search

      January 2015 - October 2015 : Fullstack developer @Mon mariage
      - Development of a multi-brand e-commerce site for announcements and their personalisation
      - Backend : Symfony 2 + jQuery
      - Frontend : HTML + CSS + jQuery

      August 2011 - January 2015 : Fullstack developer + Sysadmin @La Ligne Web
      - Creation of several dozens of ecommerce websites
      - Creation of several dozens of websites
      - PHP (Zend Framework + Codeigniter) + Wordpress + Prestashop + jQuery
      - Server management (PLESK + CPanel)

      July 2010 - December 2017 : Freelancer
      - Developing websites for no-budget projects
      - Philantropy

      January 2009 - August 2011 : creation of the web agency @Web Innovation
      - Creation of several dozens of websites
      - Creation of CMS Babel (R.I.P 2011)

      June 2006 - June 2008 : Internship + Fixed-term contract @Hexis
      - Development of a content management system
      - PHP + MySQL + Mootools + Smarty 
    `
  }, {
    location: '/',
    filename: 'EDUCATION',
    type: 'file',
    content: `
    2008 - @IUT Béziers - Professional degree in Voice/Data System Integration
    2007 - @IUT Béziers - University Diploma of Technology in Services and Communication Networks
    `
  }]

  const fix = str => str.trim().replace(/\/+/g, '/') || '/'

  const setCurrent = dir => {
    if (typeof dir !== 'undefined') {
      if (dir == '..') {
        const parts = current.split('/')
        parts.pop()
        current = fix(parts.join('/'))
      } else {
        const found = tree.filter(iter => iter.location === current)
          .find(iter => iter.filename === fix(dir))

        if (found) {
          current = fix(current + '/' + dir)
        } else {
          return `Directory '${dir}' not found in '${current}'`
        }
      }

      return `Entered '${current}'`
    }

    return current
  }

  const ls = () => {
    const found = tree.filter(iter => iter.location === current)
    const fileCount = found.filter(iter => iter.type === 'file').length
    const directoryCount = found.filter(iter => iter.type === 'directory').length
    const status = `${fileCount} file(s), ${directoryCount} dir(s)`
    const maxlen = Math.max(...found.map(iter => iter.filename).map(n => n.length))

    const list = found.map(iter => {
      return `${iter.filename.padEnd(maxlen + 1, ' ')} <${iter.type}>`
    }).join('\n')

    return `${list}\n\n${status} in ${current}`
  }

  const cat = filename => {
    const found = tree.filter(iter => iter.location === current)
    const foundFile = found.find(iter => iter.filename === filename)

    if (foundFile) {
      return foundFile.content
    }

    return `File '${filename}' not found in '${current}'`
  }

  return {
    pwd: () => setCurrent(),
    cd: dir => setCurrent(fix(dir)),
    cat,
    ls
  }
})()

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
const terminal = (options) => {
    const {banner, buflen, tickrate, prompt, commands} = options
  
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
    const clear = () => ($element.value = '')
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
      clear,
      print: output
    }
}

// Onload
const load = () => {
  const t = terminal({
    banner,
    buflen,
    tickrate,
    prompt,
    commands : {
      cat: file => browser.cat(file),
      cd: dir => browser.cd(dir),
      clear: () => t.clear(),
      contact: (key) => {
        if (key in contactInfo) {
          openContact(key)
          return `Opening - ${key} - ${contactInfo[key]}`
        }
    
        return contactText
      },
      pwd: () => browser.pwd(),
      ls: () => browser.ls(),
      help: () => helpText
    }
  })
}

document.addEventListener('DOMContentLoaded', load)