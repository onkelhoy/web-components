export function tidy(url: string | undefined) {
  if (url === undefined) return "";
  if (url === "") return url;
  if (url === "/") return "";

  let start = 0;
  let end = url.length;

  if (url.startsWith("/")) start = 1;
  if (url.endsWith("/")) end = url.length - 1;

  return url.slice(start, end);
}
export function format(url: string, trailingslash: boolean = true) {
  if (!url.startsWith("/")) url = "/" + url;

  if (url.slice(url.lastIndexOf("/"), url.length).includes(".")) return url;

  if (trailingslash) {
    if (url.endsWith("/")) return url;
    return url + "/";
  }

  if (url.endsWith("/")) return url.slice(0, url.length - 1);
  return url;
}
export function join(...parts: string[]) {
  return parts.map(tidy).filter(url => !!url).join("/");
}
export function clearHash(url: string, trailingslash?: boolean) {
  if (url.startsWith("/#")) url = url.slice(2, url.length);
  if (url.startsWith("#")) url = url.slice(1, url.length);

  return format(url, trailingslash);
} 