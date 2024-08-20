window.onload = () => {
  console.log('document C loaded');
  document.querySelector('button#btn').onclick = () => {
    console.log('document C click');
  }

  const router = document.querySelector("pap-router");
  if (router) {
    const foo = document.getElementById("foo");
    if (foo) {
      foo.innerText = router.params.foo;
    }
  }
}