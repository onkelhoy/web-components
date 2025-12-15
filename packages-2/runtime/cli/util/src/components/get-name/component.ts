export function getName(name: string) {
  if (!name) return undefined;

  const split = name.split(" ");
  const safe = split.join("-");

  return {
    safe,
    component: capitalize(split.map(capitalize).join("")),
    package: safe.toLowerCase(),
  }
}

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
