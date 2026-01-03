export function Query(query:string) {
  return query
    .split(/[ |\>|+]/)
    .filter(Boolean)
    .map(value => {
      const match = value.match(/(?<tag>\w+)?(?<class>\.\w+)?(?<id>#\w+)?(?<attribute>\[[^\]]+\])?(?<text>\{[^\}]+\})?/);
      if (!match) return null;

      const attrib = match?.groups?.attribute?.split("=");
      return {
        tag: match?.groups?.tag,
        class: match?.groups?.class,
        text: match?.groups?.text,
        id: match?.groups?.id?.replace("#", ""),
        attribute: attrib ? { name: attrib[0], value: attrib[1] ?? true } : undefined,
      };
    })
    .filter(v => v !== null)
}