import { ILambdaCaptchaConfig } from "./config";
import { LambdaCaptchaCodeExpression } from './expressions/code-expression';
import { ILambdaCaptchaExpression } from "./expressions/types";
import { renderText } from "./font";
import { LambdaCaptchaMathExpression } from "./expressions/math-expression";
import * as random from "./random";
import { encrypt, decrypt, keyToBuffer, verifySignature, encryptAndSign } from "./crypto";
import * as errors from "./errors";

export type ILambdaCaptcha = {
  /**
   * An unencrypted representation of the captcha
   */
  expr: any;
  /**
   * An unencrypted string representation of the captcha
   */
  encryptedExpr: string;
  /**
   * Captcha SVG
   */
  captchaSvg: string;

  /**
   * Unix timestamp when the captcha expires (UTC)
   */
  validUntil: number;
};

export function create(config: ILambdaCaptchaConfig): ILambdaCaptcha {
  let captcha: ILambdaCaptchaExpression;

  switch (config.mode) {
    case "code":
      captcha = LambdaCaptchaCodeExpression.generate(config.codeLength);
      break;
    case "math":
      captcha = LambdaCaptchaMathExpression.generate(2);
      break;
    default:
      throw new Error(`unknown captcha mode ${config.mode}`);
  }

  const timestamp = Date.now() + config.captchaDuration;
  const jsonToEncrypt = JSON.stringify({
    validUntil: timestamp,
    captcha: captcha.toObject()
  });

  return {
    expr: jsonToEncrypt,
    encryptedExpr: encryptAndSign(jsonToEncrypt, config.cryptoKey, config.signatureKey),
    captchaSvg: renderCaptcha(captcha, config),
    validUntil: timestamp
  };
}

export function verify(
  encryptedExpression: string,
  solution: string,
  key: string,
  signatureKey: string,
) {
  let captcha: ILambdaCaptchaExpression & { type: string }, validUntil: number;
  try {
    const message = verifySignature(encryptedExpression, keyToBuffer(signatureKey))
    // 1. Verify signature
    if (!message) {
      return errors.INVALID_DATA
    }
    
    const decrypted = decrypt(message, keyToBuffer(key));
    const parsed = JSON.parse(decrypted);

    captcha = parsed.captcha;
    validUntil = parsed.validUntil;
  } catch (e) {
    console.error(e);
    return errors.INVALID_DATA;
  }

  const currentTimestamp = Date.now();
  if (validUntil <= currentTimestamp) {
    return errors.CAPTCHA_EXPIRED;
  }

  switch (captcha.type) {
    case "code":
      const codeExpression = LambdaCaptchaCodeExpression.fromJSON(captcha);

      if (codeExpression.solve() === solution) {
        return true;
      }
      return errors.INVALID_SOLUTION;
    case "math":
      const mathExpression = LambdaCaptchaMathExpression.fromJSON(captcha);

      if (mathExpression.solve().toString() === solution) {
        return true;
      }
      return errors.INVALID_SOLUTION;
    default:
      throw new Error(`unknown captcha type ${captcha.type}`);
  }
}

/**
 * Takes an expression and returns an SVG string
 *
 * @param expression
 * @returns string SVG representation
 */
function renderCaptcha(
  expression: ILambdaCaptchaExpression,
  config: ILambdaCaptchaConfig
): string {
  let str: string;
  let background = "";
  let noise = "";
  const start = `<svg xmlns="http://www.w3.org/2000/svg" width="${150}" height="${80}" viewBox="0,0,${150},${80}">`;

  if (config.backgroundColor) {
    background = `<rect width="100%" height="100%" fill="${config.backgroundColor}"/>`;
  }

  noise = renderNoise(config).join("");

  const text = renderText(expression.toString(), config);
  str = `${start}${background}${text}${noise}</svg>`;
  return str;
}

function renderNoise(options: ILambdaCaptchaConfig) {
  if (!options.noise) {
    return [];
  }
  const { width, height } = options;
  const hasColor = options.backgroundColor;
  const noiseLines = [];
  const min = 7;
  const max = 15;
  let i = -1;

  while (++i < options.noise) {
    const start = `${random.int(1, 21)} ${random.int(1, height - 1)}`;
    const end = `${random.int(width - 21, width - 1)} ${random.int(
      1,
      height - 1
    )}`;
    const mid1 = `${random.int(width / 2 - 21, width / 2 + 21)} ${random.int(
      1,
      height - 1
    )}`;
    const mid2 = `${random.int(width / 2 - 21, width / 2 + 21)} ${random.int(
      1,
      height - 1
    )}`;
    const color = hasColor
      ? random.color(hasColor)
      : random.greyColor(min, max);
    noiseLines.push(
      `<path d="M${start} C${mid1},${mid2},${end}" stroke="${color}" fill="none"/>`
    );
  }

  return noiseLines;
}
