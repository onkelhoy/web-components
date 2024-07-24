import fs from 'node:fs';
import path from 'node:path';

import { merge, TRANSLATION_META as META, MergeOutput } from './asset';
import { Level, Language } from "./language.type";

function mergeLanguage(output: MergeOutput, level: Level, languages: Language) {
  if (!output[level]?.files) return;

  for (let file of output[level].files) {
    try {
      const name = file.filename.split('.json')[0].toLowerCase();

      const content = JSON.parse(file.content || '{}') || {};
      // think its better to use DeepMerge
      languages[name] = { ...languages[name], ...content };
    }
    catch (e) {
      console.log('[\x1b[31translation error\x1b[0m]', level, file.filename)
    }
  }
}

export function init() {
  // create the folder first
  fs.mkdirSync(path.join(process.env.VIEWDIR as string, '.temp/translations'));

  const languages: Language = {};
  merge("translations", (output, save) => {
    mergeLanguage(output, "global", languages);
    mergeLanguage(output, "package", languages);
    mergeLanguage(output, "view", languages);

    for (let lang in languages) {

      if (!languages[lang].meta) languages[lang].meta = { region: lang, language: lang };
      META[lang] = languages[lang].meta;
      save('translations/' + lang + '.json', JSON.stringify(languages[lang]))
    }
  });
}