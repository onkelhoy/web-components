import { CustomElement } from "@papit/core";

export const TRANSLATION_CHANGE_EVENTNAME = 'pap-translation-change';
export const TRANSLATION_ADDED = 'pap-translation-added';

// language data related types 
type Meta = {
  region: string;
  language: string;
};
type Translations = {
  meta?: Meta;
} & Record<string, string>;

export type Data = {
  id: string;
  url?: string;
  meta?: Meta;
  translations?: Translations;
}

export type Enhanced = Data & Required<Omit<Data, 'translations'>>;
export type Language = Required<Data>;


export type Settings = Partial<{
  languages: Data[];
  selected: string;
}>

export type TranslateSettings = Partial<{
  scope: string;
  variables: Record<string, string>;
  element: CustomElement & { dynamicAttributes: Set<string> };
}>;