window.onload = () => {
  const ps = document.querySelectorAll("body > p");
  ps.forEach(p => {
    p.textContent = p.textContent + " updated"
  });
}