import { create, verify } from "./captcha";
import { LambdaCaptchaConfigManager } from "./config";
import { LambdaCaptchaMathExpression } from "./expressions/math-expression";
import * as errors from "./errors";

describe("create", () => {
  const config = LambdaCaptchaConfigManager.default("deadbeef", "c0ffee");
  config.captchaDuration = 5000;
  const captcha = create(config);

  console.log(captcha);

  it("returns a LambdaCaptcha instance", () => {
    expect(captcha.expr).toBeDefined();
    expect(captcha.encryptedExpr).toBeDefined();
    expect(captcha.captchaSvg).toBeDefined();
  });

  it("returns a LambdaCaptcha instance with a timestamp in the validUntil field", () => {
    expect(captcha.validUntil).toBeGreaterThan(0);
  });
});

describe("verify", () => {
  const encryptedCaptchaExpression =
    "49de1af0dacea91e8ad5c7403c4ff8799eee59d877cf1f835b007c0cff571335$5d69d5de65686e1e499c50607d4e79e6:392ff5aa4f2ce6f9f36854a4fd3ff18a3e03a009b2d84c75ef09aa6874afd9ddeecf2770f7ceb93f3c7e06396341b87c962712fbb6c82ceadc216bf9b041b53aa534de85b7342c17d11f78a067b31594faf1950862d04f7eec141a7def70f277";
  const secret = "deadbeef";
  const signatureKey = "c0ffee";

  it("returns false when the captcha has expired", () => {
    const result = verify(encryptedCaptchaExpression, '7', secret, signatureKey);

    expect(result).toBe(errors.CAPTCHA_EXPIRED);
  });

  it("returns true on success", () => {
    const config = LambdaCaptchaConfigManager.default("deadbeef", signatureKey);
    config.captchaDuration = 10 * 1000;

    const captcha = create(config);
    const solution = LambdaCaptchaMathExpression.fromJSON(
      JSON.parse(captcha.expr).captcha
    ).solve();

    const result = verify(
      captcha.encryptedExpr,
      solution.toString(),
      "deadbeef",
      signatureKey
    );

    expect(result).toBeTruthy();
  });

  it("returns false on error", () => {
    const config = LambdaCaptchaConfigManager.default("deadbeef", signatureKey);
    config.captchaDuration = 10 * 1000;

    const captcha = create(config);
    const result = verify(captcha.encryptedExpr, '999', "deadbeef", signatureKey);

    expect(result).toBe(errors.INVALID_SOLUTION);
  });
});
