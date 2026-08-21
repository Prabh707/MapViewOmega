/**
 * AccessRide - Speech & Audio Accessibility Guidance Service
 * Uses browser native Web Speech API for turn-by-turn voice prompts and screen-reader assistance.
 */

class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.isEnabled = true;
    this.rate = 1.0;
    this.pitch = 1.0;
  }

  isSupported() {
    return 'speechSynthesis' in window;
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  speak(text, priority = false) {
    if (!this.isEnabled || !this.synth) return;

    if (priority) {
      this.synth.cancel(); // Interrupt previous speech for high-priority alerts
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.lang = 'en-US';

    // Choose clean standard voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira')) && v.lang.startsWith('en'));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    this.synth.speak(utterance);
  }

  announceStop(stopName, accessibilityDetails) {
    const message = `Approaching stop: ${stopName}. ${accessibilityDetails || 'Step-free platform available.'}`;
    this.speak(message, true);
  }

  announceSafetyAlert(alertText) {
    const message = `Safety notice: ${alertText}`;
    this.speak(message, true);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
