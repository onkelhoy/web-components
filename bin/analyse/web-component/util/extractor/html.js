const { parse } = require('node-html-parser');

function html_extractor(html) {
  const DOM = parse(html);

  const slots = DOM.querySelectorAll('slot');
  const parts = DOM.querySelectorAll('*[part]');

  return {
    slots: slots.map(slot => {
      return {
        name: slot.getAttribute('name') || "default",
        html: slot.innerHTML
      }
    }),
    parts: parts.map(part => {
      return {
        name: part.getAttribute('part'),
        tag: part.tagName
      }
    })
  }
}

module.exports = {
  html_extractor
}