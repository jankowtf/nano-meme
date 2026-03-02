import { runOnJS } from "../react-native-reanimated";

describe("react-native-reanimated mock", () => {
  it("runOnJS returns the same function", () => {
    const fn = () => 42;
    const wrapped = runOnJS(fn);
    expect(wrapped).toBe(fn);
  });

  it("runOnJS wrapped function is callable with args", () => {
    const add = (a: number, b: number) => a + b;
    const wrapped = runOnJS(add);
    expect(wrapped(3, 4)).toBe(7);
  });

  it("runOnJS preserves function identity", () => {
    const fn = jest.fn();
    const wrapped = runOnJS(fn);
    wrapped("test");
    expect(fn).toHaveBeenCalledWith("test");
  });
});
