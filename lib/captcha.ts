import { ILambdaCaptchaConfig } from './config'
import { ILambdaCaptchaExpression } from './expressions/types'
import { renderText } from './font'
import { LambdaCaptchaMathExpression } from './expressions/math-expression'
import * as random from './random'
import { encrypt, decrypt, keyToBuffer } from './crypto'

export type ILambdaCaptcha = {
  /**
   * An unencrypted string representation of the captcha
   */
  expr: string
  /**
   * An unencrypted string representation of the captcha
   */
  encryptedExpr: string
  /**
   * Captcha SVG
   */
  captchaSvg: string
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

  const expressionJson = expression.toJSON()
  
  return {
    expr: expressionJson,
    encryptedExpr: encrypt(expressionJson, config.cryptoKey),
    captchaSvg: renderExpression(expression, config)
  }
}

export function verify(
  encryptedExpression: string,
  solution: any,
  key: string
) {
  try {
    const expressionJson = decrypt(encryptedExpression, keyToBuffer(key))
    const o = JSON.parse(expressionJson)
    
    switch (o.type) {
      case 'math':
        const expression = LambdaCaptchaMathExpression.fromJSON(o)
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
