window.onload = () => {
  console.log('document B loaded');
  document.querySelector('button#btn').onclick = () => {
    console.log('document B click');
  }
}