// Placeholder for media stream acquisition (Phase 2)
export async function getMicStream(constraints: MediaStreamConstraints = { audio: true }) {
  return navigator.mediaDevices.getUserMedia(constraints);
}

