document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    let input = document.getElementById("user-input");
    let message = input.value.trim();
    if (!message) return;

    appendMessage("user", message);
    input.value = "";

    let chatBox = document.getElementById("chat-box");
    appendMessage("bot", "⏳ ThinkAi is typing...");

    fetch("/get", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({message: message})
    })
    .then(res => res.json())
    .then(data => {
        chatBox.lastChild.remove();
        appendMessage(data.final ? "final" : "bot", data.response);
    });
}

function appendMessage(sender, text) {
    let chatBox = document.getElementById("chat-box");
    let div = document.createElement("div");
    div.classList.add("message", sender);
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}
document.getElementById("new-chat-btn").addEventListener("click", function() {
    fetch("/reset", { method: "POST" })
    .then(res => res.json())
    .then(data => {
        document.getElementById("chat-box").innerHTML = "";
        appendMessage("bot", "Ask me anything! I am ready to help you.");
    });
});
