export type SettingCallback = (delta:number) => void;

export type Setting = {
  query: string;
  type: "2d";
  width: number;
  height: number;
  timer: null|number;
  previous: null|number;
  callbacks: SettingCallback[];
  documentElemenet: Document|HTMLElement|ShadowRoot;
}