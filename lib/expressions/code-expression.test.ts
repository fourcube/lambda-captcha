import { LambdaCaptchaCodeExpression } from "./code-expression";

describe("LambdaCaptchaCodeExpression", () => {
  it("can be turned into a string", () => {
    const expression = new LambdaCaptchaCodeExpression('abcde');

    expect(expression.toString()).toBe("abcde");
  });

  describe("generate", () => {
    it("returns an LambdaCaptchaCodeExpression", () => {
      const expression = LambdaCaptchaCodeExpression.generate();

      expect(expression.code).toHaveLength(5);
    });

    it("returns an LambdaCaptchaCodeExpression with the desired code length", () => {
      const expression = LambdaCaptchaCodeExpression.generate(4);

      expect(expression.code).toHaveLength(4);
    });
  });

  describe("solve", () => {
    it("solves an expression", () => {
      const expression = new LambdaCaptchaCodeExpression('abcde');

      expect(expression.solve()).toBe('abcde');
    });
  });
  
  describe("fromJSON", () => {
    it("converts JSON back to a code expression", () => {
      const expression = new LambdaCaptchaCodeExpression('abcde');
      const rebuilt = LambdaCaptchaCodeExpression.fromJSON(JSON.parse(JSON.stringify(expression.toObject())))
      
      expect(rebuilt).toBeInstanceOf(LambdaCaptchaCodeExpression)
      expect(rebuilt.code).toStrictEqual(expression.code)
      expect(rebuilt.solve()).toBe(expression.solve())
    });
  });
});
