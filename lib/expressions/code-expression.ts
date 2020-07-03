import { ILambdaCaptchaExpression } from "./types";

export class LambdaCaptchaCodeExpression implements ILambdaCaptchaExpression {
  constructor(
    public readonly code: string,
  ) {}

  static generate(length = 5): LambdaCaptchaCodeExpression {
    const code = Math.random().toString(36).substr(2, length);

    return new LambdaCaptchaCodeExpression(code);
  }
  
  static fromJSON(o: any): LambdaCaptchaCodeExpression {
    return Object.setPrototypeOf(Object.assign({}, o), LambdaCaptchaCodeExpression.prototype)
  }

  public solve(): string {
    return this.code;
  }

  public toString() {
    return String(this.code);
  }
  
  public toObject() {
    return {
      type: 'code',
      code: this.code
    }
  }
}
