const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");
const typingIndicator = document.getElementById("typing-indicator");

let speechEnabled = false;
let selectedVoice = null; // store female voice

// Load available voices
function loadVoices() {
  const voices = window.speechSynthesis.getVoices();
  // Try to pick a female / pleasant voice
  selectedVoice = voices.find(voice =>
    voice.name.toLowerCase().includes("female") ||
    voice.name.toLowerCase().includes("samantha") ||
    voice.name.toLowerCase().includes("google us english")
  ) || voices[0]; // fallback to first voice if not found
}
window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// Toggle speech on/off
document.getElementById("toggle-speech").addEventListener("click", () => {
  speechEnabled = !speechEnabled;
  const btn = document.getElementById("toggle-speech");
  btn.textContent = speechEnabled ? "🔊" : "🔈";
});

// Speak function
function speak(text) {
  if (!speechEnabled) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  if (selectedVoice) utterance.voice = selectedVoice;
  window.speechSynthesis.speak(utterance);
}

// Auto-scroll
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Add message bubble
function addMessage(message, sender = "bot") {
  const welcome = document.getElementById("welcome-message");
  if (welcome) {
    welcome.remove();
    chatContainer.classList.remove("flex", "items-center", "justify-center");
    chatContainer.classList.add("space-y-4");
  }

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

  if (sender === "bot") {
    speak(message);
  }
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

// 🆕 New Chat button - clears chat history
document.getElementById("new-chat").addEventListener("click", () => {
  chatContainer.innerHTML = `
    <div id="welcome-message" class="flex flex-col items-center justify-center h-full text-center text-gray-400">
      <h1 class="text-2xl font-bold text-green-400">Welcome to ThinkAi</h1>
      <p class="mt-2 text-gray-300">
        Ask me anything — but beware,<br>
        I’ll answer with more questions first 😉
      </p>
    </div>
  `;
  userInput.value = "";
});
