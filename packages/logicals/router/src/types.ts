export type ElementType = HTMLStyleElement | HTMLScriptElement;
export type PrepareElement = ElementType | HTMLLinkElement;
export type PrepareElementType = "style" | "script";


export type Params = Record<string, string>;
export type Mapping = {
  path: string;
  realpath: string | ((path: string, params: Params) => string);
};

export type URL = {
  browser_url: string;
  request_url: string;
  path: string;
  // mapped: string;
  // formated: string;
  params: Params;
}