import { ILambdaCaptchaConfig } from './config'
import { ILambdaCaptchaExpression } from './expressions/types'
import { renderText } from './font'
import { LambdaCaptchaMathExpression } from './expressions/math-expression'
import * as random from './random'
import { encrypt, decrypt, keyToBuffer } from './crypto'

export type ILambdaCaptcha = {
  /**
   * An unencrypted representation of the captcha
   */
  expr: any
  /**
   * An unencrypted string representation of the captcha
   */
  encryptedExpr: string
  /**
   * Captcha SVG
   */
  captchaSvg: string
  
  /**
   * Unix timestamp when the captcha expires (UTC)
   */
  validUntil: number
}

export function create(config: ILambdaCaptchaConfig): ILambdaCaptcha {
  let expression: ILambdaCaptchaExpression

  switch (config.mode) {
    case 'math':
      expression = LambdaCaptchaMathExpression.generate(2)
      break
    default:
      throw new Error(`unknown captcha mode ${config.mode}`)
  }

  // TODO: Generate timestamp
  
  const validUntil = 0
  const validationInfo = JSON.stringify({ expression: expression.toObject(), validUntil })
  
  return {
    expr: expression,
    encryptedExpr: encrypt(validationInfo, config.cryptoKey),
    captchaSvg: renderExpression(expression, config),
    validUntil
  }
}

export function verify(
  validationInfo: string,
  solution: any,
  key: string
) {
  try {
    const json = decrypt(validationInfo, keyToBuffer(key))
    const { expression: o, validUntil } = JSON.parse(json)
    
        
    switch (o.type) {
      case 'math':
        const expression = LambdaCaptchaMathExpression.fromJSON(o)
        
        const currentTimestamp = Math.floor(Date.now() / 1000)
        if (validUntil < currentTimestamp) {
          console.log('got', validUntil, 'which is <', currentTimestamp)
          return false
        }
        
        return expression.solve() == solution
      default:
        throw new Error(`unknown captcha type ${o.type}`)
    }
  } catch (e) {
    console.error(e)
    return false
  }
}

/**
 * Takes an expression and returns an SVG string
 *
 * @param expression
 * @returns string SVG representation
 */
function renderExpression(
  expression: ILambdaCaptchaExpression,
  config: ILambdaCaptchaConfig
): string {
  let str: string
  let background = ''
  let noise = ''
  const start = `<svg xmlns="http://www.w3.org/2000/svg" width="${150}" height="${80}" viewBox="0,0,${150},${80}">`

  if (config.backgroundColor) {
    background = `<rect width="100%" height="100%" fill="${
      config.backgroundColor
    }"/>`
  }

  noise = renderNoise(config).join('')

  const text = renderText(expression.toString(), config)
  str = `${start}${background}${text}${noise}</svg>`
  return str
}

function renderNoise(options: ILambdaCaptchaConfig) {
  if (!options.noise) {
    return []
  }
  const { width, height } = options
  const hasColor = options.backgroundColor
  const noiseLines = []
  const min = 7
  const max = 15
  let i = -1

  while (++i < options.noise) {
    const start = `${random.int(1, 21)} ${random.int(1, height - 1)}`
    const end = `${random.int(width - 21, width - 1)} ${random.int(
      1,
      height - 1
    )}`
    const mid1 = `${random.int(width / 2 - 21, width / 2 + 21)} ${random.int(
      1,
      height - 1
    )}`
    const mid2 = `${random.int(width / 2 - 21, width / 2 + 21)} ${random.int(
      1,
      height - 1
    )}`
    const color = hasColor ? random.color(hasColor) : random.greyColor(min, max)
    noiseLines.push(
      `<path d="M${start} C${mid1},${mid2},${end}" stroke="${color}" fill="none"/>`
    )
  }

  return noiseLines
}
