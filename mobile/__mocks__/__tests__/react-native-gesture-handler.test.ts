import { Gesture, GestureHandlerRootView, GestureDetector } from "../react-native-gesture-handler";

describe("react-native-gesture-handler mock", () => {
  it("exports GestureHandlerRootView", () => {
    expect(GestureHandlerRootView).toBeDefined();
  });

  it("exports GestureDetector", () => {
    expect(GestureDetector).toBeDefined();
  });

  it("Gesture.Pan returns chainable gesture", () => {
    const pan = Gesture.Pan();
    expect(pan.onStart).toBeDefined();
    expect(pan.onUpdate).toBeDefined();
    expect(pan.onEnd).toBeDefined();
  });

  it("Gesture.Pinch returns chainable gesture", () => {
    const pinch = Gesture.Pinch();
    expect(pinch.onStart).toBeDefined();
    expect(pinch.onUpdate).toBeDefined();
  });

  it("Gesture.Tap returns chainable gesture with numberOfTaps", () => {
    const tap = Gesture.Tap();
    const chained = tap.numberOfTaps(2);
    expect(chained.onStart).toBeDefined();
  });

  it("Gesture.Simultaneous combines gestures", () => {
    const combined = Gesture.Simultaneous(Gesture.Pan(), Gesture.Pinch());
    expect(combined.onStart).toBeDefined();
  });

  it("Gesture.Race combines gestures", () => {
    const raced = Gesture.Race(Gesture.Tap(), Gesture.Pan());
    expect(raced.onStart).toBeDefined();
  });
});
