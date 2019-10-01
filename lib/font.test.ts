import { loadFont } from "./font";
import { join } from "path";

describe("loadFont", () => {
  it("returns an opentype font on success", () => {
    const font = loadFont(
      join(__dirname, "../fonts/FiraCode-Bold.otf")
    );

    expect(font).toBeDefined();
  });

  it("throws on error", () => {
    expect(() => {
      loadFont(join(__dirname, "../fonts/nope.otf"));
    }).toThrow();
  });
});
