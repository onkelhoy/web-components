// core
import '@papit/core';
import '@papit/translator';
import "@papit/typography";
import "@papit/card";
import "@papit/codeblock";

// component
import '@papit/page-showcase';

window.onload = () => {
  console.log('[demo]: window loaded');

  const showcase = document.querySelector("pap-showcase");
  showcase.data = [
    {
      name: "atoms",
      displayname: "Atoms",
      packages: [
        {
          name: "button",
          displayname: "Button"
        },
        "icon",
      ]
    },
    {
      name: "molecules",
      packages: ["input", "select"]
    }
  ]
}
