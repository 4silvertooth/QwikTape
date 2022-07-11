import tape from "../src/parser/tape-embedded.js";

function parse(input) {
  const lex = tape.lexer.tokenize(input);
  tape.parser.input = lex.tokens;
  let ast = tape.parser.tape();
  return {lex: lex, parser: tape.parser, ast: ast}
}

test('lexer', () => {
  expect(parse("-900").lex.errors).toEqual([]);
  expect(parse("-900").lex.tokens).toHaveLength(2);
  expect(parse("900.").lex.errors).toEqual([]);
  expect(parse(".50").lex.errors).toEqual([]);
  expect(parse(".50 .50").lex.errors).toEqual([]);
  expect(parse("900.").lex.errors).toEqual([]);
  expect(parse("p").lex.errors).toEqual([]);
});

test('line comments', () => {
  expect(parse("a b\nc").lex.errors).toEqual([]);
  expect(parse("a b\nc").ast).toBeInstanceOf(Array);
  expect(parse("a b\nc\n").lex.errors).toEqual([]);
  expect(parse("a\nc").lex.errors).toEqual([]);
  expect(parse("a \n  c \n").lex.errors).toEqual([]);
});

test('line comments starting with unicodes', () => {
  expect(parse("હેલો  a \n  c \n").lex.errors).toEqual([]);
  expect(parse("હેલો  a \n  c \n").parser.errors).toEqual([]);
  expect(parse("હેલો\n  c \n").parser.errors).toEqual([]);
});

test('annotations', () => {
  expect(parse("12 test").lex.errors).toEqual([]);
  expect(parse("12 test").parser.errors).toEqual([]);
  expect(parse("12 = test").lex.tokens[1].image).toEqual("= test");
  expect(parse("12 = test\n+ 12\n═══\n  24.00 = test").parser.errors).toEqual([]);
  expect(parse("12 = test\n+ 12\n═══\n  24.00 = test").lex.tokens[8].image).toEqual("=");
  expect(parse("12 = test\n+ 12\n═══\n  24.00 = test").lex.tokens[9].image).toEqual("test");
});

test('invalid expression needs newline between', () => {
  expect(parse("12 + 12").lex.errors).toEqual([]);
  expect(parse("12 + 12").parser.errors).toEqual([]);
  expect(parse("12\n").ast).toEqual([]);
  expect(parse("12 + 12").ast).toEqual([]);
  expect(parse("હેલો  a \n 1 * 1  c \n").parser.errors).toHaveLength(0);
});

test('expression add', () => {
  expect(parse("12 \n+ 12").lex.errors).toEqual([]);
  expect(parse("12 \n+ 12").parser.errors).toEqual([]);
  expect(parse("12 \n+ 12").ast).toEqual([]);
  expect(parse("12 \n+ 12\n").ast).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
          value: "24.00", 
          node: expect.any(Object)
        }
      )]
    )
  );
});

test('expression multiply', () => {
  expect(parse("12 \n* 12").lex.errors).toEqual([]);
  expect(parse("12 \n* 12").parser.errors).toEqual([]);
  expect(parse("12 \n* 12").ast).toEqual([]);
  expect(parse("12 \n* 12\n").ast).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
          value: "144.00", 
          node: expect.any(Object)
        }
      )]
    )
  );
  expect(parse("test = 12\ntest \n* 12\n").ast).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
          value: "144.00", 
          node: expect.any(Object)
        }
      )]
    )
  );
});

test('expression with unicode operator', () => {
  expect(parse("5 \n× 5").lex.errors).toEqual([]);
  expect(parse("5 \n× 5").parser.errors).toEqual([]);
  expect(parse("5 \n× 5").ast).toEqual([]);
  expect(parse("5 \n× 5\n").ast).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
          type: tape.tokenType.Insert,
          value: "25.00", 
          node: expect.any(Object)
        }
      )]
    )
  );
  expect(parse("test = 12\ntest \n× 12\n").ast).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
          value: "144.00", 
          node: expect.any(Object)
        }
      )]
    )
  );
});

test('result after expression', () => {
  expect(parse("12 \n+ 12").ast).toEqual([]);
  expect(parse("12 \n+ 12\n══\n24").ast).toEqual([]);
  expect(parse("12 \n+ 12\n══\n25").ast).toEqual([]);
  expect(parse("test = 12\n12\n+          test\n══\n25").ast).toEqual([]);
  expect(parse("test = 1\n     test\n+          2\n").ast).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
          type: tape.tokenType.Insert,
          value: "3.00", 
          node: expect.any(Object)
        }
      )]
    )
  );  
});

test('expression with comments', () => {
  expect(parse("12 this is a comment \n+ 12").ast).toEqual([]);
  expect(parse("12 \n+ 12 comment").ast).toEqual([]);
  expect(parse("12 \n+ 12\n══\n24 comment").ast).toEqual([]);
  expect(parse("12\n+ 12\n══\n24 = test").parser.errors).toEqual([]);
  expect(parse("12 \n+ 12\n══\n24 = test\n+test\n").ast).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
          type: tape.tokenType.Insert,
          value: "48.00",          
          node: expect.any(Object)
        }
      )]
    )
  );
  expect(parse("12 \n+ 12\n══\n25").ast).toEqual([]);
});

test('variables in expression', () => {
  expect(parse("test = 12").ast).toEqual([]);
  expect(parse("test = 12\ntest\n+12").ast).toHaveLength(0);
  expect(parse("test = 12\ntest\n+12\n").ast).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
          type: tape.tokenType.Insert,
          value: "24.00", 
          node: expect.any(Object)
        }
      )]
    )
  );
});

test('variable change in expression', () => {
  expect(parse("15\r\n+20\r\n══\r\n30 = test\r\ntest\r\n+20\r\n══\n50").parser.errors.lenght).toEqual(0);
});

test('editing expression after result', () => {
  expect(parse("12\n+12\r\n\r\n══\n24").parser.errors.length).toEqual(1);
  expect(parse("12\n+12\r\n\n══\n24").parser.errors.length).toEqual(1);
  expect(parse("12\n+12\r\n+\r\n══\n24").ast).toEqual([]);
});