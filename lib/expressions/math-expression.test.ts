import { LambdaCaptchaMathExpression } from "./math-expression";

describe("LambdaCaptchaMathExpression", () => {
  it("can be turned into a string", () => {
    const expression = new LambdaCaptchaMathExpression([1, 2], ["+"]);

    expect(expression.toString()).toBe("1+2");
  });

  describe("generate", () => {
    it("returns an LambdaCaptchaMathExpression", () => {
      const expression = LambdaCaptchaMathExpression.generate();

      expect(expression.operands).toHaveLength(2);
      expect(expression.operators).toHaveLength(1);
    });

    it("returns an ILambdaCaptchaMathExpression with the desired operand count", () => {
      const expression = LambdaCaptchaMathExpression.generate(4);

      expect(expression.operands).toHaveLength(4);
      expect(expression.operators).toHaveLength(3);
    });
  });

  describe("solve", () => {
    it("solves an expression", () => {
      const expression = new LambdaCaptchaMathExpression([5, 8], ["+"]);

      expect(expression.solve()).toBe(13);
    });

    it("throws an error on unknown operators", () => {
      const expression = new LambdaCaptchaMathExpression([5, 8], ["*" as any]);

      expect(() => expression.solve()).toThrow()
    });
  });
  
  describe("fromJSON", () => {
    it("converts JSON back to a math expression", () => {
      const expression = new LambdaCaptchaMathExpression([5, 8, 11], ["+", "-"]);
      const rebuilt = LambdaCaptchaMathExpression.fromJSON(JSON.parse(expression.toJSON()))
      
      expect(rebuilt).toBeInstanceOf(LambdaCaptchaMathExpression)
      expect(rebuilt.operators).toStrictEqual(expression.operators)
      expect(rebuilt.operands).toStrictEqual(expression.operands)
      expect(rebuilt.solve()).toBe(expression.solve())
    });
  });
});
