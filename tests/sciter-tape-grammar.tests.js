const {default: tape} = sciter.import("../src/parser/tape-embedded.js");

function parse(input) {
  const lex = tape.lexer.tokenize(input);
  tape.parser.input = lex.tokens;
  let ast = tape.parser.tape();
  return {lex: lex, parser: tape.parser, ast: ast}
}

function any(expected){
  return (received)=>[received instanceof expected, expected.name];
}

test('lexer', () => {
  expect(parse("-900").lex.errors).equal([]);
  expect(parse("-900").lex.tokens).haveLength(2);
  expect(parse("900.").lex.errors).equal([]);
  expect(parse(".50").lex.errors).equal([]);
  expect(parse(".50 .50").lex.errors).equal([]);
  expect(parse("900.").lex.errors).equal([]);
  expect(parse("p").lex.errors).equal([]);
});

test('line comments', () => {
  expect(parse("a b\nc").lex.errors).equal([]);
  expect(parse("a b\nc").ast).instanceOf(Array);
  expect(parse("a b\nc\n").lex.errors).equal([]);
  expect(parse("a\nc").lex.errors).equal([]);
  expect(parse("a \n  c \n").lex.errors).equal([]);
});

test('line comments starting with unicodes', () => {
  expect(parse("હેલો  a \n  c \n").lex.errors).equal([]);
  expect(parse("હેલો  a \n  c \n").parser.errors).equal([]);
  expect(parse("હેલો\n  c \n").parser.errors).equal([]);
});

test('annotations', () => {
  expect(parse("12 test").lex.errors).equal([]);
  expect(parse("12 test").parser.errors).equal([]);
  expect(parse("12 = test").lex.tokens[1].image).equal("= test");
  expect(parse("12 = test\n+ 12\n═══\n  24.00 = test").parser.errors).equal([]);
  expect(parse("12 = test\n+ 12\n═══\n  24.00 = test").lex.tokens[8].image).equal("=");
  expect(parse("12 = test\n+ 12\n═══\n  24.00 = test").lex.tokens[9].image).equal("test");
});

test('invalid expression requiring newline', () => {
  expect(parse("12 + 12").lex.errors).equal([]);
  expect(parse("12 + 12").parser.errors).equal([]);
  expect(parse("12\n").ast).equal([]);
  expect(parse("12 + 12").ast).equal([]);
  expect(parse("હેલો  a \n 1 * 1  c \n").parser.errors).haveLength(0);
});

test('expression add', () => {
  expect(parse("12 \n+ 12").lex.errors).equal([]);
  expect(parse("12 \n+ 12").parser.errors).equal([]);
  expect(parse("12 \n+ 12").ast).equal([]);
  expect(parse("12 \n+ 12\n").ast[0]).contain({"value": "24.00"});
  expect(parse("12 \n+ 12\n").ast[0]).contain({"value": "24.00", node: {"image": "\n"}});
})

test('expression multiply', () => {
  expect(parse("12 \n* 12").lex.errors).equal([]);
  expect(parse("12 \n* 12").parser.errors).equal([]);
  expect(parse("12 \n* 12").ast).equal([]);
  expect(parse("12 \n* 12\n").ast[0]).contain({value: "144.00", node: any(Object)});
  expect(parse("test = 12\ntest \n* 12\n").ast[0]).contain({value: "144.00", node: any(Object)})
});

test('expression with unicode operator', () => {
  expect(parse("5 \n× 5").lex.errors).equal([]);
  expect(parse("5 \n× 5").parser.errors).equal([]);
  expect(parse("5 \n× 5").ast).equal([]);
  expect(parse("5 \n× 5\n").ast[0]).contain({
    type: tape.tokenType.Insert,
    value: "25.00", 
    node: any(Object)
  })
  expect(parse("test = 12\ntest \n× 12\n").ast[0]).contain({
    value: "144.00", 
    node: any(Object)
  });
});

test('result after expression', () => {
  expect(parse("12 \n+ 12").ast).equal([]);
  expect(parse("12 \n+ 12\n══\n24").ast).equal([]);
  expect(parse("12 \n+ 12\n══\n25").ast).equal([]);
  expect(parse("test = 12\n12\n+          test\n══\n25").ast).equal([]);
  expect(parse("test = 1\n     test\n+          2\n").ast[0]).contain({
    type: tape.tokenType.Insert,
    value: "3.00", 
    node: any(Object)
  });
});

test('expression with comments', () => {
  expect(parse("12 this is a comment \n+ 12").ast).equal([]);
  expect(parse("12 \n+ 12 comment").ast).equal([]);
  expect(parse("12 \n+ 12\n══\n24 comment").ast).equal([]);
  expect(parse("12\n+ 12\n══\n24 = test").parser.errors).equal([]);
  expect(parse("12 \n+ 12\n══\n24 = test\n+test\n").ast[0]).contain({
    type: tape.tokenType.Insert,
    value: "48.00",          
    node: any(Object)
  });
  expect(parse("12 \n+ 12\n══\n25").ast).equal([]);
});

test('variables in expression', () => {
  expect(parse("test = 12").ast).equal([]);
  expect(parse("test = 12\ntest\n+12").ast).haveLength(0);
  expect(parse("test = 12\ntest\n+12\n").ast[0]).contain({
    type: tape.tokenType.Insert,
    value: "24.00", 
    node: any(Object)
  });
});

test('variable change in expression', () => {
  expect(parse("15\r\n+20\r\n══\r\n30 = test\r\ntest\r\n+20\r\n══\n50").parser.errors.length).equal(0);
});

test('editing expression after result', () => {
  expect(parse("12\n+12\r\n\r\n══\n24").parser.errors.length).equal(1);
  expect(parse("12\n+12\r\n\n══\n24").parser.errors.length).equal(1);
  expect(parse("12\n+12\r\n+\r\n══\n24").ast).equal([]);
});