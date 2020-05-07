var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
var command = ''
let KEY_TIMEOUT = 1000

function createLinkItem (link, rect, key) {
  var item = document.createElement('span')
  item.setAttribute('style', 'position: absolute; padding: 1px 3px 0px 3px; background-color: yellow; color: black; z-index: 9999; font-family: Helvetica, Arial, sans-serif;font-weight: bold;font-size: 12px; background: linear-gradient(to bottom, #FFF785 0%,#FFC542 100%); border: solid 1px #C38A22; border-radius: 3px; box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.3);')

  item.textContent = key

  item.style.top = (window.scrollY + rect.top) + 'px'
  item.style.left = (window.scrollX + rect.left) + 'px'

  return item
}

function isVisible (rect) {
  return (
    rect.top > 0 &&
    rect.top < window.innerHeight &&
    rect.left > 0 &&
    rect.left < window.innerWidth
  )
}

function getNextKeyCombination (index) {
  // use 1st half of alphabet for single letter, and 2nd half for double letter, so that no collisions can occur
  if (index < 13) {
    return alphabet[index]
  } else {
    // two-letter combination
    return alphabet[Math.floor(index / 13) + 12] + alphabet[index % 26]
  }
}

var currentLinkItems = []
var isLinkKeyMode = false
var openLinkNewTab = false
var typedText = ''

function showLinkKeys () {
  isLinkKeyMode = true
  typedText = ''

  var links = []
  var linkRects = [];

  [].slice.call(document.querySelectorAll('a, button')).forEach(function (link) {
    var rect = link.getBoundingClientRect()
    if (isVisible(rect)) {
      links.push(link)
      linkRects.push(rect)
    }
  })

  links.forEach(function (link, i) {
    var key = getNextKeyCombination(currentLinkItems.length)
    var item = createLinkItem(link, linkRects[i], key)
    currentLinkItems.push({
      link: link,
      element: item,
      key: key
    })
    document.body.appendChild(item)
  })
}

function hideLinkKeys () {
  isLinkKeyMode = false

  currentLinkItems.forEach(i => i.element.remove())
  currentLinkItems = []
}

function onTextTyped (key) {
  typedText += key

  currentLinkItems.forEach(function (link) {
    if (link.key === typedText) {
      if (link.link.tagName === 'A') {
        if (openLinkNewTab) {
          window.open(link.link.href)
        } else {
          window.open(link.link.href, '_top')
        }
      } else if (link.link.tagName === 'BUTTON') {
        link.link.click()
      }
      hideLinkKeys()
    } else if (!link.key.startsWith(typedText)) {
      link.element.hidden = true
    }
  })
}

function isCurrentlyInInput () {
  return document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA'
}

// We use keydown here to match Escape.
// We do not want to prevent default as this will
// prevent copying stuff and likely much more.
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && isLinkKeyMode) {
    hideLinkKeys()
  }
})

// We use keypress here for ease of matching
document.addEventListener('keypress', function (e) {
  if (!isCurrentlyInInput() && !isLinkKeyMode) {
    command += e.key
    var match = true
    switch(command) {
      case 'f':
        showLinkKeys()
        openLinkNewTab = false
        break;
      case 'F':
        showLinkKeys()
        openLinkNewTab = true
        break;
      // Use j to scroll down
      case 'j':
        window.scrollBy(0, 60)
        break;
      // Use k to scroll up
      case 'k':
        window.scrollBy(0, -60)
        break;
      case 'yy':
        var dummy = document.createElement('input'),
        text = window.location.href;

        document.body.appendChild(dummy);
        dummy.value = text;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        break;
      case 'gg':
        window.scrollTo(0,0)
        break;
      case 'G':
        window.scrollTo(0,document.body.scrollHeight);
        break;
      default:
        match = false
        break;
    }
    if (!match && command.length === 1) {
      // Reset typed command after KEY_TIMEOUT milliseconds
      // This is the time the user has to type the full command
      setTimeout(function () {
        command = ''
      }, KEY_TIMEOUT);
    } else if (match) {
      command = ''
      // We could also at it to a buffer here for repeating the action via '.' as in Vim
    }
    e.preventDefault()
  } else if (isLinkKeyMode) {
    onTextTyped(e.key)
  }
})
