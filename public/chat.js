// First, define variables
const chatInput = document.getElementById('chatInput');
const sendMsg = document.getElementById('sendMsg');
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');

// Removed ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID from here

async function sendMessageToQuantumAI(query) {
  const response = await fetch('/api/chat', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  return data.answer;
}

function addMessage(role, text) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', role === 'user' ? 'user' : 'bot');

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.textContent = text;

  msgDiv.appendChild(bubble);
  chatMessages.insertBefore(msgDiv, typingIndicator);
}

async function speak(text) {
  try {
    const ttsResponse = await fetch('/api/tts', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text })
    });

    if (!ttsResponse.ok) {
      console.error("TTS request failed");
      return;
    }

    const audioData = await ttsResponse.arrayBuffer();
    const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);
    await audio.play();
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
  } catch (err) {
    console.error("Error in speak function:", err);
  }
}

async function handleSend() {
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;

  addMessage('user', userMsg);
  chatInput.value = '';

  // Show typing indicator
  typingIndicator.style.visibility = 'visible';

  const response = await sendMessageToQuantumAI(userMsg);

  // Hide typing indicator once response is received
  typingIndicator.style.visibility = 'hidden';

  addMessage('assistant', response);
  speak(response);
}

sendMsg.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleSend();
  }
});

// On page load, show initial message from bot
window.addEventListener('DOMContentLoaded', async () => {
  // Show typing indicator
  typingIndicator.style.visibility = 'visible';

  // Simulate a short delay as if the bot is "loading"
  await new Promise(r => setTimeout(r, 1000)); // 1 second delay

  // Hide typing indicator and show initial message
  typingIndicator.style.visibility = 'hidden';
  const initialMessage = "Welcome to the QuantumVerse, how may I assist you?";
  addMessage('assistant', initialMessage);
  speak(initialMessage);
});
