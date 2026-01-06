import { getPathInfo, LocalPackage } from "@papit/cli";
import { createExplorer } from "./explorer";

export async function getHTML(
  info: ReturnType<typeof getPathInfo>,
  assets: Record<string, string[]>,
  packageJSON: LocalPackage,
  FFs: string[],
  currentURL: string,
) {
  const document = createExplorer(assets, info, packageJSON, FFs, currentURL);

  return document;
}


  // const baseDOM = new Document();
  // let baseTemplateSource = path.join(info.script!, "asset/templates/base.html");
  // if (typeof Arguments.args.flags['base-template'] === "string" && fs.existsSync(Arguments.args.flags['base-template']))
  // {
  //   baseTemplateSource = Arguments.args.flags['base-template'];
  // }

  // if (!fs.existsSync(baseTemplateSource))
  // {
  //   console.log(info.script);
  //   Terminal.error("could not find base template html file");
  //   process.exit(1);
  // }

  // const content = fs.readFileSync(baseTemplateSource, { encoding: "utf-8" });
  // baseDOM.innerHTML = content;

  // const htmlFiles = FFs
  //   .filter(name => name.endsWith(".html"))
  //   .sort((a, b) => {
  //     if (a.startsWith("index")) return 1;
  //     return a.localeCompare(b);
  //   });
    
  // if (htmlFiles.length > 0)
  // {
  //   const dom = new Document();
  //   const content = fs.readFileSync(path.join(currentURL, htmlFiles[0]), { encoding: "utf-8" });
  //   dom.innerHTML = content;

  //   if (dom.body) 
  //   {
  //     baseDOM.body!.innerHTML = dom.body.innerHTML;
  //   }

  //   // if (dom.querySelector())
  //   // if 

  //   // let html!: Element;
  //   // let head!: Element;

  //   // if (!dom.querySelector("html"))
  //   // { 
  //   //   html = dom.createElement("html");
  //   //   html.innerHTML = content;
  //   //   dom.innerHTML = html.outerHTML;
  //   // }

  //   // if (!dom.querySelector("head"))
  //   // {
  //   //   head = dom.createElement("head");
  //   //   head.innerHTML = `
  //   //     <meta />
  //   //     <meta /> 
  //   //     <link data-theme rel="stylesheet" href="" />
  //   //     <title>${packageJSON.name}</title>
  //   //   `
  //   //   html.appendChild(head);
  //   // }
  //   // if (!head.querySelector("style[data-theme]"))
  //   // {
  //   //   const theme = dom.createElement("link");
  //   //   // theme.attributes['data-theme'] = true;
  //   //   // theme.attributes[]
  //   // }
  //   // if (head.querySelector)
  // }
  // else 