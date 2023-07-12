const express = require('express');
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { parse } = require('node-html-parser');

// locale files
const { deepMerge } = require('./util');
const { server:socketserver, update:socketupdate, error:socketerror } = require('./socket');

const app = express();

const SCRIPT_DIR = process.argv[2];
const PACKAGE_DIR = process.argv[3];
// const ROOT_DIR = process.argv[4];
const SUBFOLDER = process.argv[5];
const HTMLFILE = process.argv[6];

const htmlfilename = HTMLFILE.split('/').pop()

const viewfolder = path.join(PACKAGE_DIR, "views", SUBFOLDER);
const outputfolder = path.join(viewfolder, '.devserver-temp');

process.on('EXIT', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

let cleanupcalls = 0;
function cleanup() {
    if (cleanupcalls > 0) return;
    cleanupcalls++;

    console.log('disposing esbuild context')
    Object.values(contexts).forEach(v => v.ctx.dispose());

    process.exit(0);  // This is important to ensure the process actually terminates
}

let CONFIG = {
    port: 3000
};
try {
    LOCAL_CONFIG = JSON.parse(fs.readFileSync(path.join(viewfolder, '.config'), 'utf-8'))
    CONFIG = deepMerge(CONFIG, LOCAL_CONFIG);
}
catch {}

const clientHTML = fs
    .readFileSync(path.join(SCRIPT_DIR, "client.html"), 'utf-8')
    .replace('PORT', CONFIG.port);

app.get('*', async (req, res) => {
    let url = req._parsedUrl.pathname;
    const [status, file] = await getFile(url);
    
    if (status === 200 && url.endsWith('.js'))
    {
        res.setHeader('Content-Type', 'application/javascript');
    }
    res.status(status).end(file);
})

const RebuildPlugin = {
    name: 'rebuild',
    setup(build) {
        build.onEnd(result => {
            try {
                const name = build.initialOptions.entryPoints[0];
                contexts[name].builds++;
                if (contexts[name].builds > 1)
                {
                    if (result.errors.length > 0) {
                        socketerror(filename, result.errors)
                        return 
                    } 
    
                    const filename = name.split('/').pop();
                    const url = path.join(outputfolder, filename);
                    const file = fs.readFileSync(url, 'utf-8');
                    socketupdate(filename, file);
                }
            }
            catch (error) 
            {
                console.log(error)
                console.log('something went wrong')
            }
        })
    },
}

async function watch(file_path, output_dist) {
    if (!contexts[file_path])
    {
        // build once
        await esbuild.build({
            entryPoints: [file_path],
            bundle: true,
            outfile: output_dist,
        });

        // watcher build
        const ctx = await esbuild.context({
            entryPoints: [file_path],
            bundle: true,
            outfile: output_dist,
            plugins: [RebuildPlugin],
        });
        contexts[file_path] = {ctx, builds: 0};
        await ctx.watch();
    }
}

const contexts = {};
async function getFile(url) {
    try {
        if (url === "/")
        {
            url = htmlfilename;
        }

        const file_path = path.join(viewfolder, url);
        if (url.includes('favicon')) {
            // Check if file exists
            if (fs.existsSync(file_path)) {
                // If the file exists, read it and return
                const faviconFile = fs.readFileSync(file_path);
                return [200, faviconFile];
            } else {
                // If the file doesn't exist, read the default one and return
                const defaultFaviconPath = path.join(SCRIPT_DIR, 'favicon.ico');
                const defaultFaviconFile = fs.readFileSync(defaultFaviconPath);
                return [200, defaultFaviconFile];
            }
        }

        if (url.endsWith('.html'))
        {
            const html = fs.readFileSync(file_path, 'utf-8');
            const document = parse(html);
            document.querySelector('head').appendChild(parse(clientHTML));

            return [200, document.toString()];
        }
        if (url.endsWith('.map'))
        {
            const file = fs.readFileSync(path.join(outputfolder, url), 'utf-8');
            return [200, file];
        }
        if (url.endsWith('circular-design-tokens.css'))
        {
            const file = fs.readFileSync(path.resolve(SCRIPT_DIR, '../../design-tokens/tokens.css'))
            return [200, file]
        }
        if (/\.(jpe?g|png|gif)$/i.test(url))
        {
            const image = fs.readFileSync(path.join(viewfolder, url));
            return [200, image];
        }
        if (!url.endsWith('.js') && !url.endsWith('.css'))
        {
            const file = fs.readFileSync(path.join(viewfolder, url), 'utf-8');
            return [200, file];
        }

        const filename = url.split('/').pop();
        const output_dist = path.join(outputfolder, filename);

        await watch(file_path, output_dist);

        try {
            const output = fs.readFileSync(output_dist, 'utf-8');
            return [200, output];
        }
        catch (error) {
            console.log(error);

            return [404, "file not found"]
        } 
    }
    catch (error) {
        console.log(error);

        return [500, "server crashed"]
    }
}


const httpServer = app.listen(CONFIG.port, () => {
  console.log(`devserver started on port ${CONFIG.port}`);
});

httpServer.on('upgrade', (request, socket, head) => {
  socketserver.handleUpgrade(request, socket, head, (socket) => {
    socketserver.emit('connection', socket, request);
  });
});
