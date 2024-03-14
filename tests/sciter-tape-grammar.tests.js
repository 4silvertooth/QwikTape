const { BigNumEnv, BigNum } = sciter.import("../src/parser/bignum.js");

const locale = [
  `1234567.89`,
  `1234567,89`,
  `1,234,567.89`,
  `1.234.567,89`,
  `1 234 567.89`,
  `1 234 567,89`,
  `12,34,567.89`,
  `12 34 567.89`,
  `1'234'567.89`,
  `1'234'567,89`,
  `1.234.567'89`,
  `1˙234˙567.89`,
  `1˙234˙567,89`,
  `1,234,567·89`,
];

BigNumEnv.initLocale();
const { QwikTape } = sciter.import("../src/parser/tape-embedded.js");

function any(expected){
  return (received)=>[received instanceof expected, expected.name];
}

function parse(input) {
  const lex = QwikTape.lexer.tokenize(input);
  QwikTape.parser.input = lex.tokens;
  let ast = QwikTape.parser.tape();
  return {
    lex: lex, 
    parser: QwikTape.parser, 
    ast: ast
  };
}

for(let TEST_LOCALE = 0; TEST_LOCALE < locale.length; TEST_LOCALE++) {
  
testGroup(`${locale[TEST_LOCALE]} Format`, ()=> {

  const REAL = locale[TEST_LOCALE];
  const INT = locale[TEST_LOCALE].slice(0, -3);
  const D = locale[TEST_LOCALE].slice(-3, -2);
  const SUM = BigNum(1234567) + BigNum(1234567);
  const MULT = BigNum(1234567) * BigNum(1234567);

  test('BigNum parseString', ()=>{
    expect(BigNum.parseString(INT)).equal(BigNum(1234567));
    expect(BigNum.parseString(INT) + BigNum.parseString(INT)).defined();
    expect(BigNum.parseString(INT).toLocaleString()).defined();
    expect(BigNum.parseString(REAL)).equal(BigNum(1234567.89));
    expect(BigNum.parseString(REAL) + BigNum.parseString(REAL)).defined();
    expect(BigNum.parseString(REAL).toLocaleString()).defined();
  });
  
  test('lexer', () => {
    expect(parse(`-${INT}`).lex.errors).equal([]);
    expect(parse(`-${INT}`).lex.tokens).haveLength(2);
    expect(parse(`-${REAL}`).lex.errors).equal([]);
    expect(parse(`-${REAL}`).lex.tokens).haveLength(2);
    expect(parse(`${INT}${D}`).lex.errors).equal([]);
    expect(parse(`${D}50`).lex.errors).equal([]);
    expect(parse(`${D}50 ${D}50`).lex.errors).equal([]);
    expect(parse(`${INT}${D}`).lex.errors).equal([]);
    expect(parse(`p`).lex.errors).equal([]);
  });

  test('line comments', () => {
    expect(parse(`a b\nc`).lex.errors).equal([]);
    expect(parse(`a b\nc`).ast).instanceOf(Array);
    expect(parse(`a b\nc\n`).lex.errors).equal([]);
    expect(parse(`a\nc`).lex.errors).equal([]);
    expect(parse(`a \n  c \n`).lex.errors).equal([]);
  });

  test('line comments starting with unicodes', () => {
    expect(parse(`હેલો  a \n  c \n`).lex.errors).equal([]);
    expect(parse(`હેલો  a \n  c \n`).parser.errors).equal([]);
    expect(parse(`હેલો\n  c \n`).parser.errors).equal([]);
  });

  test('annotations', () => {
    expect(parse(`${INT} test`).lex.errors).equal([]);
    expect(parse(`${INT} test`).parser.errors).equal([]);
    expect(parse(`${INT} = test`).lex.tokens[1].image).equal(`= test`);
    expect(parse(`${INT} = test\n+ ${INT}\n═══\n  ${SUM.toLocaleString()} = test`).parser.errors).equal([]);
    expect(parse(`${INT} = test\n+ ${INT}\n═══\n  ${SUM.toLocaleString()} = test`).lex.tokens[9].image).equal(`=`);
    expect(parse(`${INT} = test\n+ ${INT}\n═══\n  ${SUM.toLocaleString()} = test`).lex.tokens[10].image).equal(`test`);
  });

  test('invalid expression requiring newline', () => {
    expect(parse(`${INT} + ${INT}`).lex.errors).equal([]);
    expect(parse(`${INT} + ${INT}`).parser.errors).equal([]);
    expect(parse(`${INT}\n`).ast).equal([]);
    expect(parse(`${INT} + ${INT}`).ast).equal([]);
    expect(parse(`હેલો  a \n 1 * 1  c \n`).parser.errors).haveLength(0);
  });

  test('expression add', () => {
    expect(parse(`${INT} \n+ ${INT}`).lex.errors).equal([]);
    expect(parse(`${INT} \n+ ${INT}`).parser.errors).equal([]);
    expect(parse(`${INT} \n+ ${INT}`).ast).equal([]);
    expect(parse(`${INT} \n+ ${INT}\n`).ast[0]).contain({'value': SUM.toLocaleString()});
    expect(parse(`${INT} \n+ ${INT}\n`).ast[0]).contain({'value': SUM.toLocaleString(), node: {'image': `\n`}});
  })

  test('expression multiply', () => {
    expect(parse(`${INT} \n* ${INT}`).lex.errors).equal([]);
    expect(parse(`${INT} \n* ${INT}`).parser.errors).equal([]);
    expect(parse(`${INT} \n* ${INT}`).ast).equal([]);
    expect(parse(`${INT} \n* ${INT}\n`).ast[0]).contain({value: MULT.toLocaleString(), node: any(Object)});
    expect(parse(`test = ${INT}\ntest \n* ${INT}\n`).ast[0]).contain({value: MULT.toLocaleString(), node: any(Object)})
  });

  test('expression with unicode operator', () => {
    expect(parse(`${INT} \n× ${INT}`).lex.errors).equal([]);
    expect(parse(`${INT} \n× ${INT}`).parser.errors).equal([]);
    expect(parse(`${INT} \n× ${INT}`).ast).equal([]);
    expect(parse(`${INT} \n× ${INT}\n`).ast[0]).contain({
      type: QwikTape.tokenType.Insert,
      value: MULT.toLocaleString(), 
      node: any(Object)
    })
    expect(parse(`test = ${INT}\ntest \n× ${INT}\n`).ast[0]).contain({
      value: MULT.toLocaleString(), 
      node: any(Object)
    });
  });

  test('result after expression', () => {
    expect(parse(`${INT} \n+ ${INT}`).ast).equal([]);
    expect(parse(`${INT} \n+ ${INT}\n══\n${SUM.toLocaleString()}`).ast).equal([]);
    expect(parse(`test = ${INT}\n${INT}\n+          test\n══\n${SUM.toLocaleString()}`).ast).equal([]);
    expect(parse(`test = ${INT}\n     test\n+          ${INT}\n`).ast[0]).contain({
      type: QwikTape.tokenType.Insert,
      value: `${SUM.toLocaleString()}`, 
      node: any(Object)
    });
  });

  test('expression with comments', () => {
    expect(parse(`${INT} this is a comment \n+ ${INT}`).ast).equal([]);
    expect(parse(`${INT} \n+ ${INT} comment`).ast).equal([]);
    expect(parse(`${INT} \n+ ${INT}\n══\n${SUM.toLocaleString()} comment`).ast).equal([]);
    expect(parse(`${INT}\n+ ${INT}\n══\n${SUM.toLocaleString()} = test`).parser.errors).equal([]);
    
    expect(parse(`${INT} \n+ ${INT}\n══\n${SUM.toLocaleString()} = test\n+test\n`).ast[0]).contain({
      type: QwikTape.tokenType.Insert,
      value: (SUM + SUM).toLocaleString(),          
      node: any(Object)
    });
    expect(parse(`${INT} \n+ ${INT}\n══\n${SUM.toLocaleString()}`).ast).equal([]);
  });

  test('variables in expression', () => {
    expect(parse(`test = ${INT}`).ast).equal([]);
    expect(parse(`test = ${INT}\ntest\n+${INT}`).ast).haveLength(0);
    expect(parse(`test = ${INT}\ntest\n+${INT}\n`).ast[0]).contain({
      type: QwikTape.tokenType.Insert,
      value: SUM.toLocaleString(),
      node: any(Object)
    });
  });

  test('variable change in expression', () => {
    expect(parse(`15\r\n+20\r\n══\r\n30 = test\r\ntest\r\n+20\r\n══\n50`).parser.errors.length).equal(0);
  });

  test('editing expression after result', () => {
    expect(parse(`${INT}\n+${INT}\r\n\r\n══\n2469134.00`).parser.errors.length).equal(1);
    expect(parse(`${INT}\n+${INT}\r\n\n══\n2469134.00`).parser.errors.length).equal(1);
    expect(parse(`${INT}\n+${INT}\r\n+\r\n══\n2469134.00`).ast).equal([]);
  });
}, 

  () => QwikTape.changeLocale(locale[TEST_LOCALE]) 

);

}