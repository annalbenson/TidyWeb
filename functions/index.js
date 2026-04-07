import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiKey = defineSecret('GEMINI_API_KEY');

const SYSTEM_PROMPT = `You are Tilly, a warm and knowledgeable cleaning assistant inside the Tidy app. Your personality:

- Friendly, encouraging, and practical — like a supportive friend who happens to know a lot about cleaning
- You use the 🌿 emoji occasionally (your signature) but don't overdo it
- Keep answers concise (2-4 sentences for simple questions, more for detailed how-tos)
- Give specific, actionable advice — brand names, ratios, techniques
- If someone seems overwhelmed, reassure them that small consistent steps matter most
- You can discuss cleaning tips, stain removal, routines, product recommendations, organization, and home maintenance
- If asked about something totally unrelated to home/cleaning, gently redirect: "That's outside my wheelhouse! I'm best at cleaning tips, routines, and home stuff. What can I help you tidy up?"
- Never give medical, legal, or financial advice

The user is chatting with you inside their chore management dashboard. They may have chores, rooms, and a cleaning schedule set up.`;

export const tillyChat = onCall(
    { secrets: [geminiKey], cors: true },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'You must be signed in.');
        }

        const { messages } = request.data;
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new HttpsError('invalid-argument', 'messages is required.');
        }

        const genAI = new GoogleGenerativeAI(geminiKey.value());
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Gemini requires history to start with role 'user'; drop leading Tilly messages
        const history = messages.slice(0, -1)
            .map(m => ({ role: m.from === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
        while (history.length > 0 && history[0].role === 'model') history.shift();

        const chat = model.startChat({
            systemInstruction: SYSTEM_PROMPT,
            history,
        });

        const lastMsg = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMsg.text);
        const text = result.response.text();

        return { reply: text };
    }
);
