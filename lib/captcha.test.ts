import { create, verify } from "./captcha";
import { LambdaCaptchaConfigManager } from "./config";
import { LambdaCaptchaMathExpression } from "./expressions/math-expression";
import * as errors from "./errors"

describe("create", () => {
  const config = LambdaCaptchaConfigManager.default("deadbeef");
  const captcha = create(config);
  
  it("returns a LambdaCaptcha instance", () => {
    expect(captcha.expr).toBeDefined();
    expect(captcha.encryptedExpr).toBeDefined();
    expect(captcha.captchaSvg).toBeDefined();
  });
  
  it('returns a LambdaCaptcha instance with a timestamp in the validUntil field', () => {
    expect(captcha.validUntil).toBeGreaterThan(0)
  })
});

describe("verify", () => {
  const encryptedCaptchaExpression =
    "0109792f8d910f4695387cfd75312cd9:008cb7a02e402004cf258c75c66e9c323c765c7528333e97b979315185900133bf3254239941233b9edb2c4c21b08abc46708d02b3edc2827a19bac39134a181b6dca61ac6243656b99af187cf222fb5c095a1bc10b2eb10bde902733eec4fd1";
  const secret = "deadbeef";
  
  it("returns false when the captcha has expired", () => {
    const result = verify(encryptedCaptchaExpression, 7, secret);
    
    expect(result).toBe(errors.CAPTCHA_EXPIRED);
  })
  
  it("returns true on success", () => {
    const config = LambdaCaptchaConfigManager.default("deadbeef");
    config.captchaDuration = 10 * 1000;
    
    const captcha = create(config);
    const solution = LambdaCaptchaMathExpression.fromJSON(JSON.parse(captcha.expr).captcha).solve()
    
    const result = verify(captcha.encryptedExpr, solution, "deadbeef")
    
    expect(result).toBeTruthy()
  });
  
  it("returns false on error", () => {
    const result = verify(encryptedCaptchaExpression, 0, secret);
    
    expect(result).toBe(errors.CAPTCHA_EXPIRED);
  });
});
