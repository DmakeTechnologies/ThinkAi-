const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");
const typingIndicator = document.getElementById("typing-indicator");

// Auto-scroll
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Add message bubble
function addMessage(message, sender = "bot") {
  const wrapper = document.createElement("div");
  wrapper.classList.add(sender === "user" ? "user-message" : "bot-message");

  const avatar = document.createElement("div");
  avatar.classList.add("avatar");
  avatar.textContent = sender === "user" ? "👤" : "🤖";

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble", sender === "user" ? "user-bubble" : "bot-bubble");
  bubble.textContent = message;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatContainer.appendChild(wrapper);

  scrollToBottom();
}

// Typing animation
function showTyping(show) {
  typingIndicator.style.display = show ? "block" : "none";
  scrollToBottom();
}

// Send message
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  showTyping(true);

  const response = await fetch("/get", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  const data = await response.json();

  showTyping(false);
  addMessage(data.response, "bot");
}
//   // Speak bot response aloud
//   const utterance = new SpeechSynthesisUtterance(data.response);
//   speechSynthesis.speak(utterance);
// }

// Voice input
micBtn.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = (event) => {
    userInput.value = event.results[0][0].transcript;
    sendMessage();
  };
});

// Send on button click
sendBtn.addEventListener("click", sendMessage);

// Send on Enter
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
