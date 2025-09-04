import {Peer} from "@papit/webrtc"
let connected = false, p2pclient;

window.onload = async function () {
  const joinshow = document.querySelector('section#join');
  const networkshow = document.querySelector('section#network');
  const loadingshow = document.querySelector('section#loading');

  const network_peers = document.querySelector('section#network div#peers');
  const network_info = document.querySelector('section#network div#info');
  const messageList = document.querySelector('section#network div#messages ul');

  const join_list = document.querySelector('section#join ul');
  const join_input = document.querySelector('section#join input');
  const join_createbutton = document.querySelector('section#join button#create');
  const join_setnamebutton = document.querySelector('section#join button#setname');
  const join_refreshbutton = document.querySelector('section#join button#refresh');


  const messageForm = document.querySelector("form");
  if (messageForm)
  {
    messageForm.onsubmit = (e) => {
      e.preventDefault();
      const formdata = new FormData(e.target);

      const message = formdata.get("text");
      p2pclient.broadcast("chat", message);

      appendMessage(p2pclient.info.user.name ?? "Bob Lazar " + p2pclient.id, message, true);
    }
  }


  p2pclient = new Peer({
    logLevel: 'info',
    // server: 'https://render-webrtc-signal-server.onrender.com',
    // socket: {
    //   url: 'ws://localhost:3000'
    // }
  });
  window.p2pclient = p2pclient;

  p2pclient.on("socket-open", () => {
    loadingshow.classList.add("hide");
    joinshow.classList.remove("hide");
  })

  p2pclient.on('network', (info) => {
    // we are connected or it got updated
    if (!connected)
    {
      connected = true;
      initiateNetwork(info);

      if (p2pclient.id === p2pclient.host)
      {
        p2pclient.set("media", "chat");
      }

      joinshow.classList.toggle('hide');
      networkshow.classList.toggle('hide');
    }
    else
    {
      // update but wont have it for now
    }
  });

  function appendMessage(from, message, me) {
    const liElement = document.createElement("li");

    if (me) liElement.classList.add("me");

    const fromElement = document.createElement("p");
    fromElement.innerHTML = from;

    const messageElement = document.createElement("p");
    messageElement.innerHTML = message;

    liElement.append(fromElement, messageElement);

    messageList.append(liElement);
  }

  p2pclient.on('add-peer', peerinfo => {
    const li = document.createElement('li');
    li.innerText = peerinfo.name || 'Bob Lazar ' + peerinfo.id;
    li.setAttribute('id', peerinfo.id);
    network_peers.querySelector('ul').appendChild(li);
  });

  p2pclient.on('delete-peer', id => {
    const target = network_peers.querySelector(`ul > li#${id}`);
    if (target) target.parentNode().removeChild(target);
  });

  p2pclient.onMessage("chat", ({id, message}) => {

    const from = p2pclient.getPeerInfo(id);
    appendMessage(from.name ?? "Bob Lazar " + id, message);
  })

  function initiateNetwork(info) {
    const name = document.createElement('h4');
    name.innerText = "Network - " + info.name;

    const me = document.createElement('p');

    me.innerText = `Me: ${p2pclient.info.user.name ?? "Bob Lazar " + p2pclient.id}`;

    network_info.appendChild(name);
    network_info.appendChild(me);
  }

  join_createbutton.onclick = function () {
    if (join_input.value)
    {
      p2pclient.register({
        name: join_input.value
      });
    }
  }

  join_setnamebutton.onclick = function () {
    p2pclient.set('user', {name: joinshow.querySelector('input#name').value});
  }

  function join(e) {
    const id = e.target.getAttribute('id');
    p2pclient.join(id);
  }

  join_refreshbutton.onclick = function () {
    refresh();
  }
  refresh();

  function addListItem(text) {
    const li = document.createElement("li");
    join_list.appendChild(li);
    li.innerText = text;

    return li;
  }

  async function refresh() {
    join_list.innerHTML = "";
    const res = await fetch("https://render-webrtc-signal-server.onrender.com/network");
    const json = await res.json();

    if (json.length > 0)
    {
      json.map(network => {
        const li = addListItem(network.name);
        li.setAttribute('id', network.id);
        li.onclick = join;
      })
    }
    else
    {
      addListItem('no network');
    }
  }
}