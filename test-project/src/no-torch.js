// React Native
import Torch from "react-native-torch"; // Non-compliant: torch should not be enabled

Torch.switchState(true);

// Web API (MediaTrackConstraints)
export async function example() {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
  const [track] = mediaStream.getVideoTracks();

  // Non-compliant: programmatically enables torch via advanced constraints
  await track.applyConstraints({ advanced: [{ torch: true }] });

  // Compliant: no torch constraint
  await track.applyConstraints({ advanced: [{ facingMode: "environment" }] });
}
