require('dotenv').config();
const express = require('express');
const path = require('path');
const { ELEVENLABS_API_KEY, OPENAI_API_KEY, ELEVENLABS_VOICE_ID } = process.env;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Chat endpoint - uses OPENAI_API_KEY on server-side
app.post('/api/chat', async (req, res) => {
  const userQuery = req.body.query || "";
  try {
    const messages = [
      { role: "system", content: "You are QuantumAI, a helpful AI assistant. Always incorporate quantum concepts and analogies into your responses." },
      { role: "user", content: userQuery }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "I encountered a quantum fluctuation.";
    res.json({ answer: answer.trim() });
  } catch (error) {
    console.error("Error from OpenAI request:", error);
    res.status(500).json({ answer: "An error occurred in the Quantum realm." });
  }
});

// TTS endpoint - uses ELEVENLABS_API_KEY on server-side
app.post('/api/tts', async (req, res) => {
  const text = req.body.text || "";
  try {
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 1.0
        }
      })
    });

    if (!ttsResponse.ok) {
      console.error("ElevenLabs TTS request failed:", ttsResponse.statusText);
      return res.status(500).json({ error: "TTS failed" });
    }

    const audioData = await ttsResponse.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioData));
    
  } catch (err) {
    console.error("Error in TTS function:", err);
    res.status(500).json({ error: "An error occurred in TTS." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
