window.onload = () => {
  console.log('document A loaded');
  document.querySelector('button#btn').onclick = () => {
    console.log('document A click');
  }

  const ps = document.querySelectorAll("body>p");
  ps.forEach(p => {
    p.textContent = p.textContent + " updated"
  });
}