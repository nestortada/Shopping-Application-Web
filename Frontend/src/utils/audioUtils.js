/**
 * This is a fallback script that generates an audio beep
 * when the notification sound file can't be found.
 * 
 * Usage:
 * Instead of loading an external MP3 file, the application
 * can use this AudioContext API to generate a beep sound.
 * 
 * Add this script to your project and call playBeep() 
 * as a fallback when the MP3 loading fails.
 */

function playBeep() {
  try {
    // Creating an AudioContext
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Creating an oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect oscillator to gain node and then to the speakers
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set parameters for the beep sound
    oscillator.type = 'sine'; // Sine wave - a pure tone
    oscillator.frequency.value = 880; // Frequency in Hz (A5)
    gainNode.gain.value = 0.1; // Volume (0-1)
    
    // Start and stop the beep
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2); // Beep for 200ms
    
    // Set up a gradual volume decrease (prevent click sound)
    gainNode.gain.exponentialRampToValueAtTime(
      0.001, audioContext.currentTime + 0.2
    );
    
    return true;
  } catch (error) {
    console.error('Error playing beep:', error);
    return false;
  }
}

// Export the function
export { playBeep };
