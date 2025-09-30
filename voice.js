function speak(text) {
  if ('speechSynthesis' in window) speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}