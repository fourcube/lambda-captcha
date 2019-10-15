import { ILambdaCaptchaExpression } from "./types";
const availableOperators: ILambdaCaptchaMathExpressionOperators[] = ["+", "-"];
export type ILambdaCaptchaMathExpressionOperators = "+" | "-";

export class LambdaCaptchaMathExpression implements ILambdaCaptchaExpression {
  constructor(
    public readonly operands: number[],
    public readonly operators: ILambdaCaptchaMathExpressionOperators[]
  ) {}

  static generate(operandCount = 2): LambdaCaptchaMathExpression {
    const operands = [];
    const operators: ILambdaCaptchaMathExpressionOperators[] = [];

    for (let i = 0; i < operandCount; i++) {
      operands.push(Math.max(Math.floor(Math.random() * 10), 1));
    }

    for (let i = 0; i < Math.max(operandCount - 1, 1); i++) {
      operators.push(
        availableOperators[Math.floor(Math.random() * operators.length)]
      );
    }

    return new LambdaCaptchaMathExpression(operands, operators);
  }
  
  static fromJSON(o: any): LambdaCaptchaMathExpression {
    return Object.setPrototypeOf(Object.assign({}, o), LambdaCaptchaMathExpression.prototype)
  }

  public solve(): number {
    if (!this.operands || this.operands.length < 2) {
      return NaN;
    }

    let result = 0;
    const { operands } = this;
    const operators = ["+", ...this.operators];

    for (let operandIndex = 0; operandIndex < operands.length; operandIndex++) {
      const a = operands[operandIndex];
      const op = operators[operandIndex];

      switch (op) {
        case "+":
          result += a;
          break;
        case "-":
          result -= a;
          break;
        default:
          throw new Error(`unknown operator ${op}`);
      }
    }
    return result;
  }

  public toString() {
    let elements = [];

    for (
      let operandIndex = 0;
      operandIndex < this.operands.length;
      operandIndex++
    ) {
      const a = this.operands[operandIndex];
      if (operandIndex > 0) {
        elements.push(this.operators[operandIndex - 1]);
      }

      elements.push(a);
    }

    return elements.join("");
  }
  
  public toObject() {
    return {
      type: 'math',
      operands: this.operands,
      operators: this.operators
    }
  }
}
