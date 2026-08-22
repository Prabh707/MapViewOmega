/**
 * AccessRide - Speech & Screen-Reader Voice Guidance Service
 * Provides synthesized audio cues for visually impaired or voice-assisted travelers.
 */

export class SpeechService {
  private static enabled = false;
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

  public static setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }

  public static isEnabled(): boolean {
    return this.enabled;
  }

  public static speak(text: string, priority = false) {
    if (!this.enabled || !this.synth) return;

    try {
      // In Chromium/Edge, cancel preceding utterance to prevent audio queue stall
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select clean natural voice if available
      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(
        v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Zira'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }
}
