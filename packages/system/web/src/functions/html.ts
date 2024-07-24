// import { prepareElement } from './html-helper';

export function findComments(element: Node) {
  let arr = [];
  for (let i = 0; i < element.childNodes.length; i++) {
    let node = element.childNodes[i];
    if (node.nodeType === 8) { // Check if node is a comment
      arr.push(node);
    } else {
      arr.push.apply(arr, findComments(node));
    }
  }
  return arr;
}
function insertElement(parent: Node, comment: Node, indexes: RegExpMatchArray | null, values: any[]) {
  if (indexes === null) return;

  let target: any = values;
  for (let i = 0; i < indexes.length; i++) {
    const index = Number(indexes[i]);
    target = target[index];
  }
  try {
    parent.insertBefore(target as DocumentFragment, comment);
  }
  catch (e) {
    console.error(e);
    console.log('what is going on here', parent);
  }
}

export function html(strings: TemplateStringsArray, ...values: any[]) {
  let result = "";

  for (let i = 0; i < values.length; i++) {
    // NOTE the reason why td is because the tr would move it outside, its anyway just temp so should work in all cases
    if (values[i] instanceof Array) {
      let arr = []; // NOTE not supporting deep nested arrays now..
      for (let j = 0; j < values[i].length; j++) {
        if (values[i][j] instanceof DocumentFragment) {
          arr.push(`<!-- comment-node-${i}.${j} -->`)
        }
      }
      if (arr.length > 0) {
        result += strings[i] + arr.join(' ')
        continue;
      }
    }
    if (values[i] instanceof DocumentFragment) {
      result += strings[i] + `<!-- comment-node-${i} -->`;
      continue;
    }
    const trimmed = strings[i].trim();
    const match = trimmed.match(/.*\s(on|@)([\w-]*)=/);

    if (match) {
      const [_whole, eventtype, name] = match;
      const split = trimmed.split(eventtype + name);
      result += split[0] + ` @${name}="${i}"`
    }
    // Check if the value is undefined
    else if (values[i] === undefined) {
      // Find and exclude the attribute from the string part
      const attributePattern = /\w+="$/;
      result += strings[i].replace(attributePattern, '');
    } else {
      // Normal concatenation for defined values
      result += strings[i] + values[i];
    }
  }

  result += strings[values.length];

  const template = document.createElement("template");
  template.innerHTML = result.trim();

  const content = template.content;

  findComments(content)
    .forEach(comment => {
      const parent = comment.parentNode;
      if (parent) {
        const trimmedCommentName = comment.nodeValue?.trim();
        if (trimmedCommentName?.startsWith("comment-node")) {
          if (comment.textContent) {
            const indexes = comment.textContent.match(/\d+/g)
            insertElement(parent, comment, indexes, values);
          }
        }
        // else if (trimmedCommentName?.startsWith("comment-ref"))
        // {
        //     console.log('comment', comment.nodeValue)
        // }

        // NOTE could investigate to keep it for performance caching or something to determine which have been updating 
        parent.removeChild(comment);
      }
    })

  InitEventListeners();

  content.querySelectorAll<HTMLElement>("*").forEach(element => {
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith('@')) {
        const eventName = attr.name.slice(1);
        const indexValue = Number(element.getAttribute(attr.name));
        element.removeAttribute(attr.name);
        element.addEventListener(eventName, values[indexValue]);
      }
    });

    element.removeAttribute('"');
  });

  return content;
}

export function ReapplyEvents(element: Element, clone: Element) {
  if (!clone.__eventListeners) {
    for (const eventname in element.__eventListeners) {
      for (const event of element.__eventListeners[eventname]) {
        clone.addEventListener(eventname, event.listener, event.options);
      }
    }
  }
}

export function ReapplyEventsDeep(element: Element, clone: Element) {
  ReapplyEvents(element, clone);

  if (element instanceof HTMLSlotElement) {
    // NOTE this seems not to do anything for us..
    // if (clone instanceof HTMLSlotElement) {
    //   const elementslotchildren = element.assignedElements();
    //   const cloneslotchildren = clone.assignedElements();

    //   // console.log(element, clone, { elementslotchildren, cloneslotchildren, nodes: clone.assignedNodes() })

    //   for (let i = 0; i < elementslotchildren.length; i++) {
    //     ReapplyEventsDeep(elementslotchildren[i], cloneslotchildren[i]);
    //   }
    // }
    // else {
    //   throw new Error("[ERROR]: element is slot but clone is not..")
    // }
  }
  else {
    for (let i = 0; i < element.children.length; i++) {
      ReapplyEventsDeep(element.children[i], clone.children[i]);
    }
  }
}

function InitEventListeners() {
  if (window.eventListenersBeenInitialized) return
  window.eventListenersBeenInitialized = true;

  const originalAddEventListener = Element.prototype.addEventListener;
  const originalRemoveEventListener = Element.prototype.removeEventListener;
  const originalCloneNode = Element.prototype.cloneNode;

  Element.prototype.addEventListener = function (name: string, listener: EventListener, options?: EventListenerOptions) {
    this.__eventListeners = this.__eventListeners || {};
    const event_obj = { listener, options };
    this.__eventListeners[name] = this.__eventListeners[name] || [];

    // Find the index of the existing event listener
    const existingListenerIndex = this.__eventListeners[name].findIndex(l =>
      l.listener === listener && JSON.stringify(l.options) === JSON.stringify(options)
    );

    if (existingListenerIndex !== -1) {
      originalRemoveEventListener.call(
        this,
        name,
        this.__eventListeners[name][existingListenerIndex].listener,
        this.__eventListeners[name][existingListenerIndex].options,
      );

      this.__eventListeners[name].splice(existingListenerIndex, 1);
    }

    this.__eventListeners[name].push(event_obj);

    // this.__eventListeners[name].push(listener);
    originalAddEventListener.call(this, name, listener, options);
  };

  Element.prototype.removeEventListener = function (name: string, listener: EventListener, options?: EventListenerOptions) {
    if (this.__eventListeners && this.__eventListeners[name]) {
      const index = this.__eventListeners[name].findIndex(data => data.listener === listener && options === data.options);
      if (index !== -1) {
        this.__eventListeners[name].splice(index, 1);
      }
    }
    originalRemoveEventListener.call(this, name, listener, options);
  };

  Element.prototype.cloneNode = function (deep?: boolean) {
    const clone = originalCloneNode.call(this, deep);

    if (deep) {
      // need to iterate the children and reapply the events 
      ReapplyEventsDeep(this, clone as Element);
    }

    return clone;
  }

  Element.prototype.getEventListeners = function () {
    return this.__eventListeners;
  };
}

type EventObject = {
  listener: EventListener;
  options?: EventListenerOptions;
}
declare global {
  interface Window {
    eventListenersBeenInitialized: boolean;
  }

  interface Element {
    __eventListeners: Record<string, EventObject[]>;
    getEventListeners(): Record<string, EventObject[]>;
  }
}