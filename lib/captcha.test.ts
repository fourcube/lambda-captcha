import { create, verify } from "./captcha";
import { LambdaCaptchaConfigManager } from "./config";

describe("create", () => {
  const config = LambdaCaptchaConfigManager.default("deadbeef");
  const captcha = create(config);
  
  it("returns a LambdaCaptcha instance", () => {
    expect(captcha.expr).toBeDefined();
    expect(captcha.encryptedExpr).toBeDefined();
    expect(captcha.captchaSvg).toBeDefined();
  });
  
  it('returns a LambdaCaptcha instance with a timestamp in the validUntil field', () => {
    // TODO: Test that timestamp is > now
    expect(false).toBeTruthy()
  })
});

describe("verify", () => {
  const encryptedCaptchaExpression =
    "40edfed034f6b9d77c111509e3268644:fb0d5633049452a7f19fe89369a561f9cac391d0d4fe88d281b9dfff3f9893099947b31ae66a24dd024c951e26a9f9a905d09a39766f1f0b76f81de51de506cc08d433662f96467b8cec9ddfc9e0082ec53f8536ce259de53e2265158e401daf";
  const secret = "deadbeef";

  it("returns true on success", () => {
    const result = verify(encryptedCaptchaExpression, 6, secret);

    expect(result).toBeTruthy();
  });

  it("returns false on error", () => {
    const result = verify(encryptedCaptchaExpression, 0, secret);

    expect(result).toBeFalsy();
  });
});
