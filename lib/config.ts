import { resolve } from "path"
import { keyToBuffer } from "./crypto"

export type ILambdaCaptchaConfig = {
    /**
     * Path to OTF font file to use
     */
    fontPath: string,
    fontSize: number,
    /**
     * Mode of the captcha
     */
    mode: 'math',
    /**
     * Key to encrypt the generated expression
     */
    cryptoKey: Buffer
    /**
     * SVG width
     */
    width: number,
    /**
     * SVG height
     */
    height: number,
    /**
     * SVG Background color
     */
    backgroundColor?: string,
    /**
     * SVG Text color
     */
    textColor?: string,
    /**
     * Amount of noise 
     */
    noise?: number
    /**
     * Captcha should be valid until `Date.now() + captchaDuration`
     */
    captchaDuration: number
}

export class LambdaCaptchaConfigManager {
  static default(cryptoKey: string): ILambdaCaptchaConfig {
    return {
      fontPath: resolve(__dirname, '../fonts', 'FiraCode-Bold.otf'),
      fontSize: 40,
      mode: 'math',
      width: 150,
      height: 75,
      noise: 5,
      cryptoKey: keyToBuffer(cryptoKey),
      captchaDuration: 180 * 1000
    }
  }
}