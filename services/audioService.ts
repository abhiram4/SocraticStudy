
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(u8.byteLength);
  const view = new Uint8Array(ab);
  view.set(u8);
  return ab;
}

export const generateAudio = (
  base64Audio: string,
  mimeType?: string,
  sampleRate: number = 24000
): string => {
  const audioBytes = decode(base64Audio);

  // If the API already returns a browser-friendly format, just use it
  if (mimeType && (mimeType.startsWith('audio/wav') || mimeType.startsWith('audio/mpeg') || mimeType.startsWith('audio/ogg') || mimeType.startsWith('audio/mp4') || mimeType.startsWith('audio/webm'))) {
    const part = toArrayBuffer(audioBytes);
    const blob = new Blob([part], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  // Otherwise, assume raw PCM (L16) and wrap as WAV for maximum compatibility
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;

  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // 'RIFF'
  // file length
  view.setUint32(4, 36 + audioBytes.length, true);
  // RIFF type
  view.setUint32(8, 0x57415645, false); // 'WAVE'
  // format chunk identifier
  view.setUint32(12, 0x666d7420, false); // 'fmt '
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 for PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, byteRate, true);
  // block align
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // 'data'
  // data chunk length
  view.setUint32(40, audioBytes.length, true);

  const pcmPart = toArrayBuffer(audioBytes);
  const wavBlob = new Blob([view, pcmPart], { type: 'audio/wav' });
  return URL.createObjectURL(wavBlob);
};
