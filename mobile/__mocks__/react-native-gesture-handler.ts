// Jest mock for react-native-gesture-handler
export const GestureHandlerRootView = "GestureHandlerRootView";
export const GestureDetector = "GestureDetector";

type MockGesture = Record<string, (...args: unknown[]) => MockGesture>;

const gestureFactory = (): MockGesture => ({
  onStart: () => gestureFactory(),
  onUpdate: () => gestureFactory(),
  onEnd: () => gestureFactory(),
  onFinalize: () => gestureFactory(),
  enabled: () => gestureFactory(),
  numberOfTaps: (_n?: unknown) => gestureFactory(),
  maxDuration: (_n?: unknown) => gestureFactory(),
  minPointers: (_n?: unknown) => gestureFactory(),
  maxPointers: (_n?: unknown) => gestureFactory(),
});

export const Gesture = {
  Pan: gestureFactory,
  Pinch: gestureFactory,
  Tap: gestureFactory,
  Race: (..._gestures: unknown[]) => gestureFactory(),
  Simultaneous: (..._gestures: unknown[]) => gestureFactory(),
  Exclusive: (..._gestures: unknown[]) => gestureFactory(),
};
