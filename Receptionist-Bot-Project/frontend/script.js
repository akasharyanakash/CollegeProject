const API_BASE = "http://127.0.0.1:8080";

let clientId = localStorage.getItem("clientId");
if (!clientId) {
  clientId = "client-" + Date.now();
  localStorage.setItem("clientId", clientId);
}

function appendMessage(text, type) {
  const chat = document.getElementById("chatMessages");
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

function setQuickOptions(options) {
  const box = document.getElementById("quickOptions");
  box.innerHTML = "";

  options.forEach(option => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.onclick = () => quickMessage(option);
    box.appendChild(button);
  });
}

function quickMessage(text) {
  document.getElementById("userInput").value = text;
  sendMessage();
}

function showTyping() {
  const chat = document.getElementById("chatMessages");
  const div = document.createElement("div");
  div.className = "message bot";
  div.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    appendMessage("Voice input is not supported in this browser.", "bot");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";

  recognition.onresult = function (event) {
    document.getElementById("userInput").value = event.results[0][0].transcript;
    sendMessage();
  };

  recognition.start();
}

async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();

  if (!message) return;

  appendMessage(message, "user");
  input.value = "";

  const typingBox = showTyping();

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, message })
    });

    const result = await response.json();
    typingBox.textContent = result.reply;
    setQuickOptions(result.options || []);
  } catch (error) {
    typingBox.textContent = "Server not responding.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  appendMessage(
    "Namaste! Main My College ka Receptionist Bot hoon.\nSabse pehle, aapka naam kya hai?",
    "bot"
  );

  setQuickOptions(["Akash", "Rahul", "Priya"]);

  const input = document.getElementById("userInput");
  input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") sendMessage();
  });

  const form = document.getElementById("inquiryForm");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const payload = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        course: document.getElementById("course").value.trim(),
        message: document.getElementById("message").value.trim()
      };

      try {
        const res = await fetch(`${API_BASE}/inquiry`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload)
        });

        document.getElementById("formStatus").textContent = await res.text();
        form.reset();
      } catch (err) {
        document.getElementById("formStatus").textContent = "Server not responding.";
      }
    });
  }
});