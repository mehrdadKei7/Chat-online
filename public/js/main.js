const chatForm = document.getElementById("chat-form");
const msgInput = document.getElementById("msg");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const ul = document.getElementById("users");
const leave = document.getElementById("leave");
const typingSpan = document.getElementById("isTyping");
const showUsername = document.getElementById("username");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

showUsername.innerHTML = `User :  ${username}`;

const socket = io();

socket.emit("joinRoom", { username, room });

socket.on("loadMessages", (messages) => {
  messages.forEach((message) => {
    showMessage(message);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight; // اسکرول به پایین
});


socket.on("roomUsers", ({ room, users }) => {
  showRoomName(room);
  showUsers(users);
});

// دریافت پیام از سرور

let typingTimer;

msgInput.addEventListener("input", () => {
  socket.emit("typing");
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit("stopTyping");
  }, 2000); // 2 second delay after stopping typing
});


socket.on("displayTyping", (username) => {
  typingSpan.innerHTML = `<p>...${username} is typing</p>`;
});

socket.on("removeTyping", () => {
  typingSpan.innerHTML = "";
});



// ارسال پیام به سرور
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = msgInput.value;
  socket.emit("chatMessage", message);
  msgInput.value = "";
  msgInput.focus();
});

socket.on("message", (message) => {
  showMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight; // اسکرول خودکار به آخرین پیام
});

// نمایش پیام در UI
function showMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");

  if (message.username === username) {
    div.classList.add("left");
  } else {
    div.classList.add("right");
  }

  div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>
  `;
  chatMessages.appendChild(div);
}

// نمایش نام اتاق
function showRoomName(room) {
  roomName.innerText = room;
}

// نمایش لیست کاربران در اتاق
function showUsers(users) {
  ul.innerHTML = "";
  if (!users || users.length === 0) return;

  users.forEach((user) => {
    const li = document.createElement("li");
    if (user.isOnline == true) {
      li.innerText = `${user.username} 🟢 `;
    } else {
      li.innerText = `${user.username} 🔴`;
    }

    ul.appendChild(li);
  });
}

leave.addEventListener("click", () => {
  socket.emit("leaveRoom");
});
