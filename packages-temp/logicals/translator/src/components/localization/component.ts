import { Settings, Language, Enhanced, Data, TRANSLATION_ADDED, TRANSLATION_CHANGE_EVENTNAME, TranslateSettings } from "./types";

export class Localization {

  current!: Language;
  map: Map<string, Enhanced> = new Map();
  displaynames!: Intl.DisplayNames;
  abortControllers: Map<string, AbortController> = new Map();

  constructor(settings: Settings = {}) {

    if (window.localization) {

      if (settings.languages) {
        window.localization.add(settings.languages);

        if (settings.selected) {
          window.localization.change(settings.selected);
        }
      }

      return window.localization;
    }

    window.addEventListener(TRANSLATION_ADDED, this.handleadd);

    if ('DisplayNames' in Intl) {
      this.displaynames = new Intl.DisplayNames(['en'], { type: 'language' });
    } else {
      console.warn('Intl.DisplayNames is NOT supported in this browser.');
    }

    if (settings.languages) {
      this.add(settings.languages);

      if (settings.selected) {
        this.change(settings.selected);
      }
    }

    window.localization = this;
  }

  private handleadd = async () => {
    if (this.map.size > 0 && this.current?.id === undefined) {
      // get current language
      const current = this.detect();

      if (current) {
        let changed = await this.change(current);

        if (!changed) {
          for (const key of this.map.keys()) {
            changed = await this.change(key)
            if (changed) break;
          }

          if (!changed) {
            console.error('[ERROR]: could not change to any available languages');
          }
        }
      }
      else {
        console.warn('[WARN]: could not detect any target language');
      }
    }
  }

  private set = (data: Data) => {
    if (data.translations?.meta) {
      data.meta = data.translations.meta;
    }
    else if (!data.meta) {
      data.meta = {
        language: data.id,
        region: data.id
      }
    }

    // NOTE this would override any existing set
    this.map.set(data.id, data as Enhanced);
  }

  private detect() {
    if (this?.current?.meta) {
      return this.current.meta.language;
    }

    const langmatch = window.location.pathname.match(/\/([^/]+)/);
    if (langmatch) {
      if (this.displaynames) {
        const intlret = this.displaynames.of(langmatch[1]);
        if (intlret || intlret !== langmatch[1]) {
          // not 100% but pretty sure its a valid language as output for de -> German e.g.
          return langmatch[1];
        }
      }
      else {
        return langmatch[1];
      }
    }

    const localsession = window.localStorage.getItem('pap-translation');
    if (localsession) {
      return localsession;
    }

    const head_lang = document.head.getAttribute("lang");
    if (head_lang) {
      return head_lang;
    }

    const navigator_lang = navigator.language;
    if (navigator_lang) {
      return navigator_lang;
    }
  }

  add(...data: Array<Data | Data[]>) {
    data.forEach(d => {
      if (d instanceof Array) {
        d.forEach(this.set);
      }
      else {
        this.set(d);
      }
    });
    window.dispatchEvent(new Event(TRANSLATION_ADDED));
  }

  load(data: Data) {
    // add first 
    this.add(data);
    // then change 
    this.change(data.id);
  }

  async change(id: string) {
    let set = this.map.get(id);
    if (!set) {

      // check for region + language also
      for (const langset of this.map.values()) {
        if (langset.meta && (langset.meta.language === id || langset.meta.region === id)) {
          set = langset;
          break;
        }
      }
      if (!set) {
        console.warn(`[ERROR] could not find the provided translation ${id}`);
        window.localStorage.removeItem('pap-translation');
        return false;
      }
    }

    if (set.id === this.current?.id) {
      return true;
    }

    if (!set.translations && set.url) {
      if (this.abortControllers.has(set.url)) return;

      let error = false;
      try {
        const controller = new AbortController();
        this.abortControllers.set(set.url, controller);
        const res = await fetch(set.url, { signal: controller.signal });
        const json = await res.json();
        set.translations = json;

        this.set(set);
      }
      catch (e) {
        this.map.delete(set.id);
        window.localStorage.removeItem('pap-translation');
        console.error('[error] could not fetch translation', e)
        error = true;
      }
      finally {
        this.abortControllers.delete(set.url);
        if (error) return false;
      }
    }

    // store old-language for ease of checking 
    let oldlanguage: undefined | string = this.current?.meta?.language;

    // set set to current
    this.current = set as Language;
    window.localStorage.setItem('pap-translation', set.id);

    const newlanguage = this.current.meta.language;

    // use current to set head 
    document.head.setAttribute("lang", newlanguage);
    // also perform seemless update on URL (no update)

    window.dispatchEvent(new Event(TRANSLATION_CHANGE_EVENTNAME));
    return true;
  }

  subscribe(callback: EventListener) {
    window.addEventListener(TRANSLATION_CHANGE_EVENTNAME, callback);
  }
  unsubscribe(callback: EventListener) {
    window.removeEventListener(TRANSLATION_CHANGE_EVENTNAME, callback);
  }

  t(key: string, settings: TranslateSettings = {}) {
    return this.translate(key, settings);
  }
  translate(key: string, settings: TranslateSettings = {}) {
    const finalkey = (settings.scope ? settings.scope + "." : "") + key;

    let text = this.current?.translations?.[finalkey] || key;
    if (text === undefined && key === undefined) return;

    const regex = /{([^{}]+)}/g;
    const matches = text.match(regex);

    if (matches) {
      matches.forEach(variable => {
        const sliced = variable.slice(1, -1);
        if (settings.element) {
          const value = settings.element.getAttribute(sliced);
          console.log('variables', variable, sliced, value)
          if (value) {
            text = text.replace(variable, value);

            if (!settings.element.dynamicAttributes.has(sliced)) {
              settings.element.dynamicAttributes.add(sliced);
            }
          }
        }
        else if (settings.variables) {
          const value = settings.variables[sliced];
          if (value) {
            text = text.replace(variable, value);
          }
        }
      });
    }

    return text;
  }
}

declare global {
  interface Window {
    localization: Localization;
  }
}