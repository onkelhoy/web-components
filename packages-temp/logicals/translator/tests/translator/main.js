import '@papit/translator';

window.onload = () => {
  window.localization.add(
    {
      id: "first",
      meta: {
        region: "GB",
        language: "en-UK"
      },
      translations: {
        hello: "world",
        "variable {name}": "{name} poop"
      }
    },
    {
      id: "second",
      translations: {
        hello: "second world",
        "variable {name}": "second {name} poop"
      }
    },
    {
      id: "custom",
      url: "public/translations/custom.json"
    },
  );

  window.localization.change('first')
}