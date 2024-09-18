const fs = require("node:fs");
const http = require('http');
const path = require("node:path");
const {chromium} = require('playwright');

let server;

function build_html(component_name, MAINCLASSINFO_NAME) {
  const analysecode = fs.readFileSync(path.join(process.env.SCRIPTDIR, ".temp", MAINCLASSINFO_NAME, "analyse.bundle.js"), 'utf-8');

  const html = `
    <html>
      <head>
        <script type="module">
          ${analysecode}

          window.COMPONENT_HTML_EXTRACTOR_FUNCTION = () => {
            const temp_component = new ${component_name}();
            temp_component.connectedCallback();
            
            const html = temp_component.render();
            const properties = temp_component.getProperties();
            const tagName = temp_component.tagName;

            if (typeof html === 'string') return {html, properties, tagName};

            if ('children' in html) 
            {
              return {
                html: Array.from(html.children).map(node => node.outerHTML).join(' '),
                properties,
                tagName
              }
            } 
            
            return {html, properties, tagName};
          }
        </script>
      </head>
    </html>
  `

  fs.writeFileSync(path.join(process.env.SCRIPTDIR, ".temp", MAINCLASSINFO_NAME, "index.html"), html, 'utf-8');
}

function startserver(port, MAINCLASSINFO_NAME) {
  server = http.createServer((req, res) => {
    if (req.url === '/') {
      fs.readFile(path.join(process.env.SCRIPTDIR, ".temp", MAINCLASSINFO_NAME, "index.html"), (err, data) => {

        if (err) {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.write('Internal server error');
          res.end();
        }
        else {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(data);
          res.end();
        }
      });
    }
    else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('Not found');
      res.end();
    }
  });

  server.listen(port, () => {
    // console.log(`html-extraction-server is running at http://localhost:${port}`);
  });
}
function closeserver(MAINCLASSINFO_NAME) {
  if (server) {
    if (process.env.VERBOSE) console.log('[ANALYSE] 🟦 info - (playwright) server closing', MAINCLASSINFO_NAME)
    server.close();
    // console.log('closing html-extraction-server');
  }
}

// NOTE if slots are conditional based on some attributes it wont be included and a more extensive solution should take place 
// to handle this (using .config file or something)
async function run_playwright(port) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Load your HTML, assuming it is stored in the 'html' variable
  await page.goto(`http://localhost:${port}`);

  // Execute your function on the page and get the result
  const result = await page.evaluate(() => {
    // Here you can access any global functions available in your page's script
    return window.COMPONENT_HTML_EXTRACTOR_FUNCTION();
  });

  await browser.close();

  return result;
}

async function playwright_extractor(component_name, MAINCLASSINFO_NAME) {
  try {
    if (process.env.VERBOSE) console.log('[ANALYSE] 🟦 info - (playwright) info - built', MAINCLASSINFO_NAME)
    build_html(component_name, MAINCLASSINFO_NAME);

    const port = 3334; // random port..

    startserver(port, MAINCLASSINFO_NAME);
    const info = await run_playwright(port);
    closeserver(MAINCLASSINFO_NAME);

    return info;
  }
  catch (e) {
    console.log('[ANALYSE] ❌❌ error - playwright server crashed', e);
    closeserver();
  }
}

module.exports = {
  playwright_extractor
}