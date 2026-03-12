import { getFunctions, httpsCallable } from 'firebase/functions';

let _fn;
function getTillyChatFn() {
    if (!_fn) _fn = httpsCallable(getFunctions(), 'tillyChat');
    return _fn;
}

/**
 * Send conversation history to the Gemini-backed Cloud Function.
 * Returns Tilly's reply text.
 */
export async function askTilly(messages) {
    const { data } = await getTillyChatFn()({ messages });
    return data.reply;
}
