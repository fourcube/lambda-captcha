import { create, verify } from "./captcha";
import { LambdaCaptchaConfigManager } from "./config";

describe("create", () => {
  it("returns a LambdaCaptcha instance", () => {
    const config = LambdaCaptchaConfigManager.default("deadbeef");
    const captcha = create(config);
    expect(captcha.expr).toBeDefined();
    expect(captcha.encryptedExpr).toBeDefined();
    expect(captcha.captchaSvg).toBeDefined();
  });
});

describe("verify", () => {
  const encryptedCaptchaExpression =
    "aeb5915bd712922cb2953ba81c0b05cb:21ce379b5284ff4c3e67350ec5d2ee50fdfa64e8b024bb5d647b071fc8b16e279e765e0947785ee1429df263e3a5c81c259aafb87d2d419d6004eea57e357433";
  const secret = "deadbeef";

  it("returns true on success", () => {
    const result = verify(encryptedCaptchaExpression, 16, secret);

    expect(result).toBeTruthy();
  });

  it("returns false on error", () => {
    const result = verify(encryptedCaptchaExpression, 0, secret);

    expect(result).toBeFalsy();
  });
});
