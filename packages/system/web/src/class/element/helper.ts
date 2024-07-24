import { RenderType, Setting } from "./types";
import { CustomElement } from "./class";

export function ConvertFromString(value: string | null, type: Function) {
  switch (type.name) {
    case "Boolean":
      if (value === null) return false;
      return value === "" || value.toLowerCase() === "true" ? true : false;
    case "Number":
      return Number(value);
    case "Object":
    case "Array":
      if (value === null) return null;
      return JSON.parse(value);
    default:
      return type(value);
  }
}
export function renderStyle(setting: Setting, element: CustomElement) {
  if (!element.shadowRoot) {
    console.error('shadowroot not defined yet!')
    return;
  }

  // check if style is different 
  let targetElement = element.shadowRoot.querySelector('style');
  if (!targetElement) {
    targetElement = document.createElement("style");
    element.shadowRoot.appendChild(targetElement);
  }

  // NOTE most cases would never require style to be changed 
  if (!setting.reactiveStyling && element.stylecomperator) return;
  const styles = element.getStyle();
  if (!element.stylecomperator) {
    element.stylecomperator = document.createElement("style");
    targetElement.innerHTML = styles;
  }

  element.stylecomperator.innerHTML = styles;

  if (element.stylecomperator.innerHTML !== targetElement.innerHTML) {
    targetElement.innerHTML = element.stylecomperator.innerHTML;
  }
}
export function renderHTML(setting: Setting, element: CustomElement) {
  if (!element.shadowRoot) {
    console.error('shadowroot not defined yet!')
    return;
  }
  if (!element.render) {
    console.error('render not defined yet');
    return;
  }

  const content = element.render();
  if (!element.rendercomperator) {
    element.rendercomperator = document.createElement("template");

    // init case 
    freshRender(element, content, element.shadowRoot);
    return;
  }

  if (!setting.reactiveRendering) {
    flushHTML(element.shadowRoot);
    freshRender(element, content, element.shadowRoot);
  }
  else {
    diffing(element, content);
  }
}

// helper functions 
function freshRender(element: CustomElement, content: RenderType, parent: ShadowRoot | Element) {
  if (["string", "number", "boolean"].includes(typeof content)) {
    const strcontent = (content || "").toString();
    if (/</.test(strcontent) && />/.test(strcontent)) {
      // If it's HTML, set it directly 
      // NOTE this is not the best comperator nor the best way but its the easiest ! 
      parent.innerHTML = parent.innerHTML + strcontent;
    } else {
      // If it's plain text, create and append a text node
      const textNode = document.createTextNode(strcontent);
      parent.appendChild(textNode);
    }
  }
  else if (content instanceof DocumentFragment) {
    parent.appendChild(content);
  }
  else if (content instanceof Array) {
    content.forEach(child => {
      freshRender(element, child, parent)
    });
  }
}
function flushHTML(node: Element | ShadowRoot) {
  node.childNodes.forEach(child => {
    if (child.nodeName !== "STYLE") {
      node.removeChild(child);
    }
  });
}
function diffing(element: CustomElement, content: RenderType) {
  if (!element.rendercomperator) return;

  // flush the html
  const nodes = element.rendercomperator.querySelectorAll('*:not(style)');
  for (let node of nodes) {
    node.parentNode?.removeChild(node);
  }
  while (element.rendercomperator.firstChild) {
    element.rendercomperator.removeChild(element.rendercomperator.firstChild);
  }

  element.rendercomperator.appendChild(element.stylecomperator);
  freshRender(element, content, element.rendercomperator);

  clone(element);
  cleanup(element);
}

// diffing helpers 
function cleanup(element: CustomElement) {
  if (!element.shadowRoot) return;
  if (!element.rendercomperator) return;

  element.shadowRoot.querySelectorAll('*:not(style)').forEach(node => {
    // NOTE element node can already been removed now from a previous deletion 
    // (as it could be a child within a child)

    if (!node.parentNode) return;

    // determine which one should leave ! 
    const path = getComposedPath(element, element.shadowRoot as ShadowRoot, node);
    const templateNode = (element.rendercomperator as HTMLTemplateElement).querySelector(path.join(" > "));
    if (!templateNode) {
      // needs to go! (if not render-greedy)
      if (!path.some(p => /render-greedy/.test(p))) {
        node.parentNode.removeChild(node);
      }
    }
  });
}
function clone(element: CustomElement) {
  if (!element.shadowRoot) return;
  if (!element.rendercomperator) return;

  const clone = element.rendercomperator.cloneNode(true) as HTMLTemplateElement;

  clone.querySelectorAll('*:not(style)').forEach(node => {
    const path = getComposedPath(element, clone, node);
    const originalnode = element.rendercomperator.querySelector(path.join(' > '));
    if (originalnode) {

      // reapply events
      for (const eventname in originalnode.__eventListeners) {
        if (!node.__eventListeners[eventname]) {
          const events = originalnode.__eventListeners[eventname];
          const { listener, options } = events[events.length - 1]; // apply last event..

          node.addEventListener(eventname, listener, options);
        }
      }
    }

    const shadowNode = element.querySelector(path.join(" > "));

    if (!shadowNode) {
      // we need to traverse up the path until we find one node then insert until the end 
      let shadowtarget: ShadowRoot | Element | null = element.shadowRoot;
      let target: Element | null = node;

      if (path.length > 1) {
        for (let i = path.length - 1; i >= 0; i--) { // we need not to start at end as this case has just been checked
          const _shadownode = element.querySelector(path.slice(0, i).join(' > '));
          if (_shadownode) {
            // we found a node, now we can start inserting until we reach end of path (i==path.lenght - 1)
            shadowtarget = _shadownode;
            break;
          }
          else {
            target = node.parentElement;
          }
        }
      }

      if (target) {
        // we check if we can insert it before a element 
        // this function selects this element (if exists by traversing the next until its found in targetShadow)
        const nextElement = getNextElement(element, clone, node);
        if (nextElement) {
          shadowtarget?.insertBefore(target, nextElement);
        }
        else {
          shadowtarget?.appendChild(target);
        }

        // reapplyEventListeners(target);
      }
      else {
        console.error('[ERROR] this case should not happen')
        console.log({ shadowtarget, node, target, path })
      }
    }
    else {
      // check if it has changed ! 

      // need to keep track of which we already looked at so we know which to remove later ! 
      // const passedAttributes:string[] = []; 

      // attributes first 

      // look if changes or new attributes added 
      for (let i = 0; i < node.attributes.length; i++) {
        const name = node.attributes[i].name;
        const value = node.attributes[i].value;

        // passedAttributes.push(name);

        const shadowValue = shadowNode.getAttribute(name);
        if (shadowValue !== value) {
          // TODO mayby we want to keep its value? O.o
          shadowNode.setAttribute(name, value);
        }
      }
      // NOTE 
      // this is dangerous as many attributes are dynamically added on render 
      // plus is very rare we would have a case where we should remove attributes.. however if yes then rethink this ! 

      // // remove the left over attributes
      // for (let i=0; i<shadowNode.attributes.length; i++)
      // {
      //     const name = shadowNode.attributes[i].name;
      //     if (!passedAttributes.includes(name))
      //     {
      //         console.log(shadowNode, 'removing attribute', name, passedAttributes)
      //         shadowNode.removeAttribute(name);
      //     }
      // }

      // then content - also tricky case as we are interessted in only Text change 
      // as the rest would get also covered ! 
      node.childNodes.forEach((child, key: number) => {
        if (child.nodeType === Node.TEXT_NODE) {
          // check if its just this weird html fillers
          if (child.textContent?.trim() === "") return;

          const shadowTextNode = shadowNode.childNodes[key];
          if (shadowTextNode) {
            if (shadowTextNode.nodeType === Node.TEXT_NODE) {
              if (shadowTextNode.textContent !== child.textContent) {
                shadowTextNode.textContent = child.textContent;
              }
            }
            else {
              // NOTE this case seems not to show up really thus not implement for now
              console.error('[ERROR] if this can be seen we must update (1)')
              console.log({ shadowTextNode, child, content: child.textContent })
            }
          }
          else {
            if (shadowNode.childNodes.length === 0) {
              shadowNode.textContent = child.textContent;
            }
            else {
              console.error('[ERROR] if this can be seen we must update (2)')
              console.log({ child, content: child.textContent, shadowNode })
            }
          }
        }
      })
    }
  })
}
function getComposedPath(element: CustomElement, base: ShadowRoot | Element, target: Element) {
  const path = [];
  while (target !== base) {
    path.push(getSelector(target));
    let nexttarget = target.parentElement;
    if (nexttarget) target = nexttarget;
    else break;
  }

  return path.reverse();
}
function getSelector(node: Element) {
  const selector = [node.tagName];

  if (node.id) selector.push("#" + node.id);
  else if (node.hasAttribute("key")) selector.push(`[key="${node.getAttribute("key")}"]`);
  else if (node.hasAttribute("part")) selector.push(`[part="${node.getAttribute("part")}"]`);
  else if (typeof node.className === "string" && node.className) {
    selector.push("." + node.className.trim().replace(/ /g, "."));
  }

  // we store the render greedy so we need not to traverse DOM
  if (node.hasAttribute('render-greedy')) selector.push('[render-greedy]');

  // NOTE there's a big problem with class selection when a class can dynamically arrive..

  if (selector.length === 1) {
    // need to get child index then !
    if (node.parentNode) {
      if (node.parentNode.children.length > 1) {
        let index = 0;
        for (let i = 0; i < node.parentNode.children.length; i++) {
          if (node.parentNode.children[i] === node) {
            index = i;
            break;
          }
        }
        selector.push(`:nth-child(${index + 1})`);
      }
    }
  }

  return selector.join("");
}
function getNextElement(element: CustomElement, clone: HTMLTemplateElement, node: Element): Element | null {
  if (node.nextElementSibling) {
    const path = getComposedPath(element, clone, node.nextElementSibling);
    const shadowNode = element.querySelector(path.join(" > "));

    if (shadowNode) {
      return shadowNode;
    }

    return getNextElement(element, clone, node.nextElementSibling);
  }

  return null;
}
