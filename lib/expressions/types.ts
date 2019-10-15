import { LambdaCaptchaMathExpression } from "./math-expression";

export interface ILambdaCaptchaExpression {
  solve(): number | string
  toObject(): any
}
