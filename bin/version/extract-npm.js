async function getjsonData() {
  return new Promise((res, rej) => {
    let jsonData = '';
    process.stdin.on('data', (chunk) => {
      jsonData += chunk;
    });

    process.stdin.on('end', () => {
      res(JSON.parse(jsonData));
    });

    process.stdin.on("error", (e) => {
      rej(e);
    })
  })
}

async function init() {
  const json = await getjsonData();
  console.log(json.map(d => `${d.name.replace(/[@\/-]/g, '_')}=${d.version}`).join('\n'));
}
init();