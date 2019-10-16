import { LambdaCaptchaConfigManager } from "./config";
import { resolve } from "path";
import { existsSync } from "fs";

describe("LambdaCaptchaConfigManager", () => {
  describe("default", () => {
    it("returns a config object", () => {
      expect(LambdaCaptchaConfigManager.default('', '')).toHaveProperty("fontPath");
    });
    
    it("returns a valid default font path", () => {
      expect(existsSync(LambdaCaptchaConfigManager.default('', '').fontPath)).toBeTruthy()
    });
  });
});
