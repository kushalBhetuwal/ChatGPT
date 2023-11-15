import user from "./assets/user.svg";
import bot from "./assets/bot.svg";

const chatContainer = document.getElementById("chat_container");
const form = document.querySelector("form");
let loadInterval;
function thinking(element) {
  element.innerHTML = "";
  loadInterval =setInterval(() => {
    element.innerHTML = element.innerHTML + ".";
    if (element.innerHTML.length > 4) {
      element.innerHTML = "";
    }
  }, 200);
}

function typetext(element, text) {
  let index = 0;
  element.innerHTML = "";
  let intervalID = setInterval(() => {
    element.innerHTML += text.charAt(index);
    index++;
    if (element.innerHTML.length > text.length) {
      clearInterval(intervalID);
    }
  }, 10);
}

function displaytext(isai, value, uniqueid) {
  return `
    <div class="wrapper ${isai && "ai"}">
    <div class="chat"  >
    <div class="profile">
     <img src ="${isai ? bot : user}" alt="${isai ? "bot" : "user"}"/>
    </div>
      
    </div>
    <div class="message" id="${uniqueid}">${value}</div>
    </div>
    `;
}

function generateuniqeid() {
  const random = Math.random();
  const randomnumber = Date.now();
  const hexString = random.toString(16);

  return `id-${randomnumber}-${hexString}`;
}

async function handleSubmit(event) {
  event.preventDefault();

  const data = new FormData(form);

  //user's Chatstripe:
  chatContainer.innerHTML =
    chatContainer.innerHTML + displaytext(false, data.get("prompt"));
  form.reset();

  const uniqueID = generateuniqeid();

  //bot chatstripe:
  chatContainer.innerHTML =
    chatContainer.innerHTML + displaytext(true, "", uniqueID);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueID);
  thinking(messageDiv);

  const datares = await fetch('http://localhost:3000',{
   method: 'POST',
   headers:{
    'Content-Type': 'application/json'
   },
   body:JSON.stringify({
    prompt:data.get("prompt"),
   })
  })
  clearInterval(loadInterval);
  messageDiv.innerHTML ="";
  
  if(datares.ok){
    const data = await datares.json();
    const parsedData = data.bot.trim();
    typetext(messageDiv, parsedData);
  }
  else{
    const err = await datares.text();
    messageDiv.innerHTML = "Something went wrong!!"
    alert(err);
  }

 
}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    handleSubmit(event);
  }
});
