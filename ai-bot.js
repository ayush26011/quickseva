/* ==========================================
   QuickSeva Mitra - Multilingual AI Chatbot
   ========================================== */

const BOT_RESPONSES = {
  en: {
    welcome: "Hello! I am <strong>QuickSeva Mitra</strong>, your virtual assistant. How can I help you today? Try asking: 'I need a plumber' or 'smart wiring help'.",
    not_found: "I'm not sure how to help with that. Try searching for 'plumber', 'electrician', 'mason', or 'painter'. You can also view all service providers in our Directory page.",
    typing: "Mitra is typing...",
    plumber: "We have an expert Plumber available! <strong>Dheeraj Kumar</strong> (rating 4.8★) can help you with leaks, pipes, and fittings. <a href='#services' onclick='filterByCategory(\"Plumber\")' style='color:var(--color-accent);text-decoration:underline;font-weight:600;'>Click here to book him now.</a>",
    electrician: "For electrical issues, I recommend <strong>Mohd. Talib</strong> (rating 4.9★), our master Electrician. <a href='#services' onclick='filterByCategory(\"Electrician\")' style='color:var(--color-accent);text-decoration:underline;font-weight:600;'>Click here to view his availability.</a>",
    construction: "Building or repairing walls? <strong>Ramesh Kumar</strong> (rating 4.9★) is our featured Construction Mason. <a href='#services' onclick='filterByCategory(\"Construction\")' style='color:var(--color-accent);text-decoration:underline;font-weight:600;'>Click here to schedule a consultation.</a>",
    hardware: "Locked out or need furniture fixtures? <strong>Raju Sahu</strong> (rating 4.7★) is our Hardware Specialist. <a href='#services' onclick='filterByCategory(\"Hardware\")' style='color:var(--color-accent);text-decoration:underline;font-weight:600;'>Check his status here.</a>",
    painter: "Need home coloring? <strong>Vikram Singh</strong> (rating 4.6★) is our wall painting specialist. <a href='#services' onclick='filterByCategory(\"Painter\")' style='color:var(--color-accent);text-decoration:underline;font-weight:600;'>Book Vikram here.</a>"
  },
  hi: {
    welcome: "नमस्ते! मैं <strong>त्वरित सेवा मित्र</strong> हूँ। आज मैं आपकी क्या मदद कर सकता हूँ? कृपया पूछें: 'मुझे नल ठीक कराना है' या 'बिजली खराब है'।",
    not_found: "मुझे ठीक से समझ नहीं आया। आप 'प्लंबर', 'बिजली मिस्त्री', 'राजमिस्त्री', या 'पेंटर' लिखकर पूछ सकते हैं।",
    typing: "मित्र लिख रहा है...",
    plumber: "हमारे पास एक कुशल प्लंबर उपलब्ध हैं! <strong>धीरज कुमार</strong> (रेटिंग 4.8★) पाइप लीक और फिटिंग ठीक कर सकते हैं। <a href='#services' onclick='filterByCategory(\"Plumber\")' style='color:var(--color-accent);text-decoration:underline;font-weight:600;'>उन्हें बुक करने के लिए यहाँ क्लिक करें।</a>",
    electrician: "बिजली की समस्या के लिए, मैं <strong>मोहम्मद तालिब</strong> (रेटिंग 4.9★) की सलाह दूंगा। <a href='#services' onclick='filterByCategory(\"Electrician\")' style='color:var(--color-accent);text-decoration:underline;font-weight:600;'>उनकी उपलब्धता देखने के लिए यहाँ क्लिक करें।</a>",
    construction: "दीवार बनाने या मरम्मत के लिए, <strong>रमेश कुमार</strong> (रेटिंग 4.9★) हमारे बेहतरीन राजमिस्त्री हैं। <a href='#services' onclick='filterByCategory(\"Construction\")' style='color:var(--color-accent);text-decoration:underline;font-weight:600;'>यहाँ क्लिक करके शेड्यूल करें।</a>",
    hardware: "ताला खराब है या फर्नीचर का काम है? <strong>राजू साहू</strong> (रेटिंग 4.7★) हमारे हार्डवेयर विशेषज्ञ हैं। <a href='#services' onclick='filterByCategory(\"Hardware\")' style='color:var(--color-accent);text-decoration:underline;font-weight:600;'>यहाँ उनकी स्थिति देखें।</a>",
    painter: "घर में रंगाई करानी है? <strong>विक्रम सिंह</strong> (रेटिंग 4.6★) हमारे दीवार पेंटिंग विशेषज्ञ हैं। <a href='#services' onclick='filterByCategory(\"Painter\")' style='color:var(--color-accent);text-decoration:underline;font-weight:600;'>विक्रम को यहाँ बुक करें।</a>"
  }
};

let currentLang = "en";

function initChatbot() {
  const bubble = document.getElementById("chatbot-bubble");
  const windowEl = document.getElementById("chatbot-window");
  const closeBtn = document.getElementById("chatbot-close");
  const inputEl = document.getElementById("chatbot-input");
  const formEl = document.getElementById("chatbot-form");
  const chatBody = document.getElementById("chatbot-body");
  const enBtn = document.getElementById("lang-en");
  const hiBtn = document.getElementById("lang-hi");

  if (!bubble || !windowEl) return;

  // Toggle chatbot window
  bubble.addEventListener("click", () => {
    windowEl.classList.toggle("active");
    if (windowEl.classList.contains("active") && chatBody.children.length === 0) {
      appendBotMsg(BOT_RESPONSES[currentLang].welcome);
    }
  });

  closeBtn.addEventListener("click", () => {
    windowEl.classList.remove("active");
  });

  // Switch Language
  enBtn.addEventListener("click", () => {
    if (currentLang === "en") return;
    currentLang = "en";
    enBtn.classList.add("active");
    hiBtn.classList.remove("active");
    chatBody.innerHTML = "";
    appendBotMsg(BOT_RESPONSES.en.welcome);
  });

  hiBtn.addEventListener("click", () => {
    if (currentLang === "hi") return;
    currentLang = "hi";
    hiBtn.classList.add("active");
    enBtn.classList.remove("active");
    chatBody.innerHTML = "";
    appendBotMsg(BOT_RESPONSES.hi.welcome);
  });

  // Handle Form submit
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = inputEl.value.trim();
    if (!query) return;

    // Append user message
    appendUserMsg(query);
    inputEl.value = "";

    // Show Typing Indicator
    showTypingIndicator();

    // Process Bot reply with delay
    setTimeout(() => {
      removeTypingIndicator();
      const reply = getBotReply(query);
      appendBotMsg(reply);
    }, 850);
  });

  function appendUserMsg(text) {
    const msg = document.createElement("div");
    msg.className = "chat-msg chat-msg-user";
    // Escape user input for security
    msg.textContent = text;
    chatBody.appendChild(msg);
    scrollToBottom();
  }

  function appendBotMsg(htmlContent) {
    const msg = document.createElement("div");
    msg.className = "chat-msg chat-msg-bot";
    msg.innerHTML = htmlContent;
    chatBody.appendChild(msg);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "chat-msg chat-msg-bot typing-indicator-wrapper";
    indicator.id = "chatbot-typing-indicator";
    indicator.innerHTML = `
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    chatBody.appendChild(indicator);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById("chatbot-typing-indicator");
    if (indicator) indicator.remove();
  }

  function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Smart router logic
  function getBotReply(text) {
    const clean = text.toLowerCase().trim();
    const responses = BOT_RESPONSES[currentLang];

    if (currentLang === "en") {
      if (clean.includes("plumb") || clean.includes("leak") || clean.includes("pipe") || clean.includes("water") || clean.includes("tap") || clean.includes("basin")) {
        return responses.plumber;
      }
      if (clean.includes("electric") || clean.includes("wire") || clean.includes("light") || clean.includes("power") || clean.includes("fan") || clean.includes("switch")) {
        return responses.electrician;
      }
      if (clean.includes("construct") || clean.includes("build") || clean.includes("mason") || clean.includes("brick") || clean.includes("wall") || clean.includes("cement")) {
        return responses.construction;
      }
      if (clean.includes("hardware") || clean.includes("lock") || clean.includes("key") || clean.includes("cabinet") || clean.includes("hinge") || clean.includes("carpenter")) {
        return responses.hardware;
      }
      if (clean.includes("paint") || clean.includes("color") || clean.includes("wall paint") || clean.includes("waterproof")) {
        return responses.painter;
      }
      return responses.not_found;
    } else {
      // Hindi routing
      if (clean.includes("प्लंबर") || clean.includes("नल") || clean.includes("पाइप") || clean.includes("लीक") || clean.includes("पानी")) {
        return responses.plumber;
      }
      if (clean.includes("बिजली") || clean.includes("तार") || clean.includes("लाइट") || clean.includes("पंखा") || clean.includes("करंट") || clean.includes("स्विच")) {
        return responses.electrician;
      }
      if (clean.includes("घर") || clean.includes("दीवार") || clean.includes("राजमिस्त्री") || clean.includes("ईंट") || clean.includes("सीमेंट") || clean.includes("बनाना")) {
        return responses.construction;
      }
      if (clean.includes("कारपेंटर") || clean.includes("ताला") || clean.includes("चाबी") || clean.includes("लकड़ी") || clean.includes("हार्डवेयर")) {
        return responses.hardware;
      }
      if (clean.includes("पेंट") || clean.includes("रंग") || clean.includes("पुताई") || clean.includes("वाटरप्रूफ")) {
        return responses.painter;
      }
      return responses.not_found;
    }
  }
}

// Initialise on load
document.addEventListener("DOMContentLoaded", initChatbot);
