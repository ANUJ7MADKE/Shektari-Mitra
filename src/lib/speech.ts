export function speak(
  text: string,
  language: "en" | "mr",
  onError: (message: string) => void,
) {
  if (!("speechSynthesis" in window)) {
    onError(
      "Audio is unavailable in this browser. You can read the advice on screen.",
    )
    return
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = language === "mr" ? "mr-IN" : "en-IN"
  const voice = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith(language))
  if (voice) utterance.voice = voice
  utterance.rate = 0.9
  utterance.onerror = (e) => {
    if (e.error !== "interrupted" && e.error !== "canceled")
      onError("Audio could not play. Try English or read the advice on screen.")
  }
  window.speechSynthesis.speak(utterance)
}
export interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { results: { transcript: string }[][] }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
export function recognitionConstructor() {
  const w = window as unknown as {
    SpeechRecognition?: new () => Recognition
    webkitSpeechRecognition?: new () => Recognition
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}
