const fs = require('fs');

module.exports = {
  envtojson: (path) => {

    const file = fs.readFileSync(path, "utf-8");
    const lines = file.split(/\n/);

    const obj = {}
    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed !== "") {
        const match = trimmed.match(/([^=]+)=(.*)/);
        if (match) {
          obj[match[1]] = match[2];
        }
      }
    }

    return obj;
  }
}