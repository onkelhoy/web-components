export type EventCallback = (event: Event) => void;

type Meta = { region: string; language: string; };
type TranslationObject = { meta?: Meta } & Record<string, string>;

// call it pre-language set because it may or may not be complete yet! 
export interface BasicLanguageData {
  id: string;
  url?: string;
  meta?: Meta;
  translations?: TranslationObject;
}

export type EnhancedLanguageData = BasicLanguageData & {
  meta: Meta;
  translations?: TranslationObject;
}

// but the current language should always be a complete set !
export type LanguageData = BasicLanguageData & {
  meta: Meta;
  translations: TranslationObject;
}

export interface Localization {
  subscribe(callback: EventCallback): void;
  unsubscribe(callback: EventCallback): void;
  load(set: BasicLanguageData): void;
  /**
   * Changes the current language to the specified language.
   * @param {string} lang - The language code to switch to.
   * @return {Promise<boolean>} Indicates if the change was successful or not.
   */
  change(lang: string): Promise<boolean>;
  add(set: BasicLanguageData): void;
  addAll(array: BasicLanguageData[]): void;
  detect(): string | undefined;

  intl?: Intl.DisplayNames;
  map: Map<string, EnhancedLanguageData>;
  current: LanguageData;

  setURL: boolean;
}

declare global {
  interface Window {
    papLocalization: Localization;
  }
}