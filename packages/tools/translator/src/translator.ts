export type TranslationObject = Record<string, string>;
export const TRANSLATION_CHANGE_EVENTNAME = 'o-translation-change';
export const TRANSLATION_ADDED = 'o-translation-added';
type EventCallback = (event: Event) => void;

export interface LanguageSet {
  id: string;
  name: string;
  translations: TranslationObject;
}
export interface Translation {
  subscribe(callback: EventCallback): void;
  unsubscribe(callback: EventCallback): void;
  load(set: LanguageSet): void;
  loadAll(array: LanguageSet[]): void;
  change(id: string): void;

  map: Map<string, LanguageSet>;
  current: LanguageSet;
}

declare global {
  interface Window {
    oTranslation: Translation;
  }
}

export function load(set: LanguageSet) {
  if (!set.translations || typeof set.translations !== 'object')
    throw new Error(
      'you have to load a translation-data object<string,string>'
    );

  window.oTranslation.map.set(set.id, set); // would override
  window.oTranslation.change(set.id);
  window.dispatchEvent(new Event(TRANSLATION_ADDED));
}
export function change(id: string) {
  const set = window.oTranslation.map.get(id);
  if (!set)
    throw new Error(`Could not find language set based on id provided: ${id}`);

  window.oTranslation.current = set;
  window.dispatchEvent(new Event(TRANSLATION_CHANGE_EVENTNAME));
}
export function loadAll(array: LanguageSet[]) {
  try {
    array.forEach(set => window.oTranslation.map.set(set.id, set));
    window.dispatchEvent(new Event(TRANSLATION_ADDED));
  } catch (e) {
    console.error('error is here', e);
  }
}
export function subscribe(callback: EventCallback) {
  window.addEventListener(TRANSLATION_CHANGE_EVENTNAME, callback);
}
export function unsubscribe(callback: EventCallback) {
  window.removeEventListener(TRANSLATION_CHANGE_EVENTNAME, callback);
}
export function InitTranslations() {
  window.oTranslation = window.oTranslation || {};
  window.oTranslation.load = window.oTranslation.load || load;
  window.oTranslation.change = window.oTranslation.change || change;
  window.oTranslation.loadAll = window.oTranslation.loadAll || loadAll;
  window.oTranslation.subscribe = window.oTranslation.subscribe || subscribe;
  window.oTranslation.unsubscribe = window.oTranslation.unsubscribe || unsubscribe;
  window.oTranslation.current = window.oTranslation.current || {};
  window.oTranslation.map = window.oTranslation.map || new Map();
}