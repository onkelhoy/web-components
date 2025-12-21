window.onload = () => {
  const themematch = window.matchMedia('(prefers-color-scheme: light)');

  // Add the listener
  themematch.addEventListener('change', handleThemeChange);

  document.querySelectorAll('section.animations button').forEach(button => {
    button.onclick = () => {
      const parent = button.parentElement;
      parent.classList.toggle("play");
      console.log('play button pressed');
    }
  })

  switchMode(themematch.matches);
}

function handleThemeChange(e) {
  if (e.matches) {
    // Apply dark mode styles
    switchMode(e.matches);
  } else {
    // Apply light mode styles
    switchMode(e.matches);
  }
}

function switchMode(darkMode) {
  document.querySelectorAll("h1.theme-mode").forEach(title => {
    if (title.parentElement.classList.contains("theme-opposite")) {
      if (darkMode) {
        title.innerHTML = "Color Mode: Dark";
      }
      else {
        title.innerHTML = "Color Mode: Light"
      }
    }
    else {
      if (darkMode) {
        title.innerHTML = "Color Mode: Light";
      }
      else {
        title.innerHTML = "Color Mode: Dark"
      }
    }
  })
}