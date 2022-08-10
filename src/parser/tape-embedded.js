import { default as chevrotain } from "../chevrotain/chevrotain.min.js";

"use strict";
"use math";

// ----------------- lexer -----------------
const BigNum = globalThis.BigNum;
const BigNumEnv = globalThis.BigNumEnv;
const CstParser = chevrotain.CstParser;
const createToken = chevrotain.createToken;
const Lexer = chevrotain.Lexer;
const EmbeddedActionsParser = chevrotain.EmbeddedActionsParser;
const BaseParser = EmbeddedActionsParser;
//const BaseParser = CstParser;
const tokenMatcher = chevrotain.tokenMatcher;

const chars = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const Operator = createToken({name: "Operator", pattern: Lexer.NA});
const EOF = chevrotain.EOF;
const Sums = createToken({name: "Sums", pattern: Lexer.NA});
const Plus = createToken({ name: "Plus", pattern: /\+/, categories: [Sums, Operator] });
const Products = createToken({name: "Products", pattern: Lexer.NA});
const Mult = createToken({ name: "Mult", pattern: /[\*×]/, categories: [Products, Operator] });
const Div = createToken({ name: "Div", pattern: /[\/÷]/, categories: [Products, Operator] });
const NewLine = createToken({ name: "NewLine",  pattern: /\r?\n/});
const LParen = createToken({ name: "LParen", pattern: /\(/ });
const RParen = createToken({ name: "RParen", pattern: /\)/ });
const Pow = createToken({ name: "Power", pattern: /\^/, categories: [Operator] });

const TokenType = {NewLine: NewLine, Block: 1, Insert: 2, Tooltip: 3};

//not using ; in the parser code below to reduce noise

const Minus = createToken({ 
  name: "Minus", 
  pattern: /(?<!([-\+\*×\/÷][ \t]*)|═(\r?\n[ \t]*))-/,
  categories: [Sums, Operator],
  start_chars_hint: ['-'],
  line_breaks: false,  
})

const Seperator = createToken({
  name: "Seperator",
  pattern: /═+/,
})

const NumberLiteral = createToken({
  name: "NumberLiteral",
  pattern: matchNumberLiteral,
  line_breaks: false,
  start_chars_hint: [..."-0123456789."],
})

//parse number and calculate its decimal places and formatting
//let regexpNumberLiteral = /-?\d+(\.\d*)?|-?(\.\d+)/y
let regexpNumberLiteral = BigNumEnv.getNumeralMatcher()
function matchNumberLiteral(text, offset, lexedTokens){
  let lastToken = lexedTokens[lexedTokens.length-1]
  if(lastToken && tokenMatcher(lastToken, NumberLiteral)) {
    return null
  }
  regexpNumberLiteral.lastIndex = offset
  const match = regexpNumberLiteral.exec(text)
  
  if(!match) return null
  
  try {
    const value = BigNum.parseString(match[0])
    const mantissa = match[1] ?? match[2] ?? "0"
    match.payload = {
      parse: value,
      formatted: match[1] ? true : false,
      decimalDigits: mantissa.length-1,
      decimalPosition: match[0].length - (match[2] ? 1 : (match[1]?.length ?? 0)),
    }
  }
  catch(e){
    return null
  }
  return match
}

const Percentage = createToken({ 
  name: "Percentage",
  pattern: matchPercentage,
  line_breaks: false,
  start_chars_hint: ["%"],
})

const regexpPercentage = /(?<=\w)%(?:[ \t]*[⥱├\|][ \t]*(-?\d+(?:\.\d*)?))?/y
function matchPercentage(text, offset){
  regexpPercentage.lastIndex = offset
  const match = regexpPercentage.exec(text)
  if(match) match.payload = {seperator: ' ⥱ ', value: match[1] ?? null}
  return match
}

//not used
const Infinite = createToken({
  name: "Infinite",
  pattern: /Infinity/,
})

//don't remove \r from second match
//todo: check for behavior on browser
const Annotation = createToken({
  name: "Annotation",
  pattern: /(?<=[a-zA-Z]\w*[ \t]*=.*)[^\n]+|(?<=[\w\d]+%?[ \t]*)[^\)\+\-\*×\/\÷\r]+/,
  line_breaks: false,
  start_chars_hint: [...chars,..."123456790."],
})
  
const Text = createToken({
  name: "Text",
  pattern: /.+/,
  //pattern: matchText,
})

const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /[ \t]+/,
  group: Lexer.SKIPPED,
})

const Variable = createToken({
  name: "Variable",
  pattern: /[a-zA-Z]\w*(?=[ \t]*\=)/,
})

const Identifier = createToken({
  name: "Identifier",
  pattern: /(?<=[=\(\-\+\*×\/÷\^][ \t]*)[a-zA-Z]\w*/,
  start_chars_hint: chars,
  line_breaks: false,
})

//todo: benchmark if creating new regex is faster than iterate all tokens for a variable 
const regexpDefinedIdentifier = /(?<=\r?\n *)[a-zA-Z]\w*(?=.*(\r?\n)?[-\+\*×\/÷\^])/y
function matchDefinedIdentifier(text, offset, lexedTokens){
  regexpDefinedIdentifier.lastIndex = offset
  const match = regexpDefinedIdentifier.exec(text)
  if(!match) return match
  const definedVariable = new RegExp(`^[ \\t]*${match[0]}[ \\t]*=|^[ \\t]*${regexpNumberLiteral.source}[ \\t]*=[ \\t]*${match[0]}\\s`, "gm")
  const variable = definedVariable.test(text.substring(0, offset))
  if(!variable) return null
  return match
}

const DefinedIdentifier = createToken({
  name: "Identifier",
  pattern: matchDefinedIdentifier,
  start_chars_hint: chars,
  line_breaks: false,
})

const Equal = createToken({
  name: "Equal",
  pattern: /(?<=[a-zA-Z]\w*[ \t]*)=/,
  line_breaks: false,
  start_chars_hint: ['='],
})

//an equal present after result seperator
const ResultEqual = createToken({
  name: "Equal",
  pattern: /(?<=═\s?\n.*)=/,
  line_breaks: false,
  start_chars_hint: ['='],
})

const SuffixIdentifier = createToken({
  name: "SuffixIdentifier",
  pattern: /(?<=═\s?\n.*=[ \t]*)[a-zA-Z]\w*/,
  start_chars_hint: chars,
  line_breaks: false,
})

Equal.LABEL = "=";
ResultEqual.LABEL = "=";
Operator.LABEL = "+|-|*|×|/|÷|^";
Sums.LABEL = "+|-";
Products.LABEL = "*|×|/|÷";
NewLine.LABEL = "↵";
LParen.LABEL = "(";
RParen.LABEL = ")";
Pow.LABEL = "^";
Minus.LABEL = "-";
Percentage.LABEL = "'%' ⥱ value?";
DefinedIdentifier.LABEL = "Defined Identifier";

const tokens = [
  WhiteSpace, Seperator, NewLine,
  SuffixIdentifier,
  LParen,RParen,
  Plus, Minus,
  Mult, Div,  Pow,
  ResultEqual, Equal,
  NumberLiteral, Percentage,
  Variable, Identifier, DefinedIdentifier,
  Annotation,
  Text, 
  Operator,
]

const TapeLexer = new Lexer(tokens, {
  //positionTracking?: "full" | "onlyStart" | "onlyOffset"
  positionTracking: 'full'
})

// ----------------- parser -----------------
class TapeParser extends BaseParser {

  _vars = {}
  minPad = 1
  
  constructor() {
    super(tokens, {
      maxLookahead: 2,
      skipValidations: true,
      outputCst: false,
      recoveryEnabled: true,
    })
    const $ = this

    this.RULE("tape", (objectArgs={decimalDigits: 2, padding: 10})=>{
      this._vars = {}
      let tape = []
      let row
      Object.assign(this, objectArgs)
      
      $.MANY(()=> $.CONSUME(NewLine))
      $.MANY2(()=>{
        row = $.SUBRULE($.rows)
        if(row) tape.push(row) 
      })
      return tape
    })

    this.RULE("rows", ()=>{
      let row
      row = $.OR([
        { ALT: ()=>$.SUBRULE($.assign) },
        /*{ GATE:()=>tokenMatcher($.LA(1), Identifier) && !($.LA(1).image in this._vars),  
          ALT: ()=>{$.SKIP_TOKEN()}
        },*/
        { ALT: ()=>$.SUBRULE($.expression) },
        { ALT: ()=>{$.CONSUME(Text)} },
      ])
      $.MANY(()=>{
        $.CONSUME2(NewLine)
      })
      //$.OR2([{ALT: ()=>$.CONSUME(NewLine)},{ALT: ()=>$.CONSUME(EOF)}])
      return row
    })

    const format = (tokens, padding)=>{
      return $.ACTION(()=>{
        let lastToken = tokens[tokens.length-1]
        if(lastToken){
          if(tokenMatcher(lastToken, NumberLiteral)){
            const { startColumn, ws, payload } = lastToken
            if(startColumn - ws + payload.decimalPosition > padding) {
              const startOffset = startColumn - ws
              padding = startOffset + payload.decimalPosition + this.minPad
            }
          }
          else { //either Identifier or DefinedIdentifier
            const { startColumn, ws } = lastToken
            if(startColumn - ws + this.decimalPosition > padding) {
              const startOffset = startColumn - ws
              padding = startOffset + token.image.length - this.decimalDigits - 1 + this.minPad
            }
          }
        }
        
        //group of token inside expression
        tokens.forEach((token)=>{
          if(!token) return
          if(!tokenMatcher(token, NumberLiteral)){
            const { startColumn, payload } = token
            const desiredPadding = padding - (startColumn + token.image.length - this.decimalDigits - 1)
            if(token.padding != desiredPadding){
              Object.assign(token, {
                padding: desiredPadding
              })
            }
            return
          }
          //token is now NumberLiteral
          const { startColumn, payload } = token
          const localeString = payload.parse.toLocaleString(payload.decimalDigits)
          const localeDecimalPosition = localeString.length - Math.max(payload.decimalDigits, this.decimalDigits)
          const desiredPadding = padding + this.minPad - (startColumn + localeDecimalPosition)

          if(token.padding != desiredPadding){
            Object.assign(token, {
              padding: desiredPadding
            })
          }

          if(payload.formatted && payload.decimalDigits > this.decimalDigits){ //trim unwanted zeros behind
            if(token.value.canTrimZeros(payload.decimalDigits)){
              Object.assign(token, {
                formatting: payload.parse.toLocaleString()
              })
              return
            }
          }

          if(token.image !== localeString) {
            Object.assign(token, {
              formatting: localeString
            })
          }
        })
        return padding
      })
    }

    const evaluate = (x, operator, y)=>{
      return $.ACTION(()=>{
        if (tokenMatcher(operator, Plus)) {
          return x.value += y.value
        }  

        if (tokenMatcher(operator, Minus)) {
          Object.assign(y, {style: ['NegetiveLiteral']})          
          return x.value -= y.value
        }      

        if (tokenMatcher(operator, Mult)) {
          return x.value *= y.value
        }  
        
        if (tokenMatcher(operator, Div)) {
          try {
            return x.value /= y.value
          }
          catch(e){

            if (e instanceof RangeError){
              try {
                x.value = BigNum.div(x.value, y.value, {
                  maximumFractionDigits: BigNumEnv.prec,
                  roundingMode: 'half-even',
                })
                return x
              }
              catch(err){
                e = err
              }
            }

            Object.assign(y, {
              style: ['ErrorLiteral', 'Error'],
              tooltip: y.tooltip ? y.tooltip + "\n" + e : e,
            })
            return x
          }
          /*if(_y == BigNum(0.00)){
            Object.assign(y, {
              style: ['ErrorLiteral', 'Error'],
              tooltip: 'Divide by Zero.',
            })
            return x
          }*/
        }

        if (tokenMatcher(operator, Pow)) {
          //return x.value **= y.value
          try {
            return x.value **= y.value
          }
          catch(e){
            Object.assign(y, {
              style: ['ErrorLiteral', 'Error'],
              tooltip: e,
            })            
            return x
          }
        }  
        
        throw "Error: This operator is not yet supported"
        
      })
    }
    
    const evaluatePostfix = (x, operator, y, postfix)=>{
      let result
      let _y = y.value / BigNum(100.00)

      result = $.ACTION(()=>{
        if (tokenMatcher(operator, Plus)) {
          _y *= x.value
          return x.value += _y
        }  
 
        if (tokenMatcher(operator, Minus)) {
          Object.assign(y, {style: ['NegetiveLiteral']})
          _y *= x.value
          return x.value -= _y
        }
        
        if (tokenMatcher(operator, Mult)) {
          return x.value *= _y
        }
        
        if (tokenMatcher(operator, Div)) {
          try {
            return x.value /= _y
          }
          catch(e){

            if (e instanceof RangeError){
              try {
                x.value = BigNum.div(x.value, y.value, {
                  maximumFractionDigits: BigNumEnv.prec, 
                  roundingMode: 'half-even',
                })
                return x
              }
              catch(err){
                e = err
              }
            }

            Object.assign(y, {
              style: ['ErrorLiteral', 'Error'],
              tooltip: y.tooltip ? y.tooltip + "\n" + e : e,
            })            
            return x
          }            
        }

        if (tokenMatcher(operator, Pow)) {
          try {
            return x.value **= _y
          }
          catch(e){
            Object.assign(y, {
              style: ['ErrorLiteral', 'Error'],
              tooltip: e,
            })            
            return x
          }
        }

        throw "Error: This operator is not yet supported"
        
      })
      
      const { value, seperator } = postfix.payload
      if( value === null ||
          value !==  BigNum(_y).toFixedDecimal() //string comparison
      ){
        Object.assign(postfix, {
          formatting: "%" + seperator + BigNum(_y).toFixedDecimal(),
          ws: 0,
          padding: 0,
        })
      }
      return result
    }
    
    this.RULE("expression", ()=>{
      let lhs, op, rhs, postfix, seperator, aggregate, result
      let depth = 0, tokens = []
      let padding = this.padding
 
      lhs = $.SUBRULE($.atom)
      tokens.push(lhs)
      
      /*$.OPTION({
        GATE: ()=>tokenMatcher(lhs, Identifier) && !lhs.defined,
        DEF: ()=>$.SKIP_TOKEN()
      })*/
      
      $.MANY(()=>{
        $.OR([
          { 
            ALT: ()=>{
              op = $.SUBRULE($.op, {ARGS: [{onNewLine: true}]})
              if(depth==0) {
                padding = format(tokens, padding)
              }
              rhs = $.SUBRULE($.quark)
              postfix = $.SUBRULE($.postfix)
            if(rhs){
              let last = tokens[tokens.length-1]
              if(last.startLine != rhs.startLine) {
                tokens.push(rhs)
                padding = format(tokens, padding)
              }
            }  
            $.ACTION(()=>{
              if(!rhs) return
              if(postfix){
                evaluatePostfix(lhs, op, rhs, postfix)
              }
              else {
                evaluate(lhs, op, rhs)
              }
              depth++
            })
            } 
          },
          { GATE: ()=> depth > 0,
           	ALT: ()=>{
              aggregate = $.SUBRULE($.aggregate, {ARGS: [lhs.value, padding]})
              tokens.push(aggregate)
              padding = format(tokens, padding)
              depth = 0
          }},
        ])
      })
      
      result = $.OPTION({
        GATE: ()=> depth > 0,
        DEF: ()=>{
          let nl = $.CONSUME(NewLine)
      	  return $.ACTION(()=>{
            const value = lhs.value.toLocaleString()
            const length = value.length - this.decimalDigits + 1
            if(padding < length){
              padding = length + this.minPad
              padding = format(tokens, padding)
            }
            return {
              type: TokenType.Insert,
              value: value.toLocaleString(),
              padding: padding + this.decimalDigits,
              node: nl,
            }
          })
        }
      })

      return result
    })
            
    this.RULE("op", (assignment)=>{
      let op, nl

      nl = $.OPTION(()=>$.CONSUME(NewLine))
      op = $.CONSUME(Operator)

      if(!nl && assignment){
        Object.assign(op, assignment)
      }
      return op
    })

    this.RULE("postfix", ()=>{
      let percentage

      $.OPTION(()=>{
        percentage = $.CONSUME(Percentage)
        $.ACTION(()=>{
          const node = {
            startLine: percentage.startLine, startColumn: percentage.startColumn, 
            endLine:   percentage.endLine, endColumn:percentage.endColumn,
          }
          Object.assign(percentage, { type: TokenType.Block, node: node })
        })
      })
      $.OPTION2(()=>{
        $.CONSUME(Annotation)
      })

      return percentage
    })
    
    this.RULE("assign", ()=>{
      let variable, value, result
      variable = $.CONSUME(Variable)
      $.CONSUME(Equal)
      value = $.SUBRULE($.inlineExpression)
      result = $.ACTION(()=>{
        const key = variable.image
        if(key in this._vars){
          Object.assign(variable, {style: ['Error'], tooltip: 'Already defined.'})
        }
        else {
          this._vars[key] = value
          Object.assign(variable, {tooltip: BigNum(value).toFixedDecimal()})
        }
        //not required in ast
        //return { [key]: value.toString() }
      })
      //return result
    })
    
    this.RULE("inlineExpression", ()=>{
      let exp
      exp =  $.SUBRULE($.sumExpression)
      $.OPTION(()=>$.CONSUME(Annotation))
      return exp.value
    })

    this.RULE("sumExpression", ()=>{
      let lhs, op, rhs
      lhs = $.SUBRULE($.productExpression)

      $.MANY(()=>{
        op = $.CONSUME(Sums)
        rhs = $.SUBRULE2($.productExpression)
        evaluate(lhs, op, rhs)
      })
      
      return lhs
    })

    this.RULE("productExpression", ()=>{
      let lhs, op, rhs
      lhs = $.SUBRULE($.powerExpression)

      $.MANY(()=>{
        $.OR([
          {
            ALT: ()=>{
              op = $.CONSUME(Products)
              rhs = $.SUBRULE2($.powerExpression)
              evaluate(lhs, op, rhs)
            }
          },
          {
            ALT: ()=>{
              rhs = $.SUBRULE($.parenthesis)
              evaluate(lhs, Mult, rhs)
            }
          }
        ])
      })

      return lhs
    })

    this.RULE("powerExpression", ()=>{
      let lhs, op, rhs
      lhs = $.SUBRULE($.inlineAtom)

      $.MANY(()=>{
        op = $.CONSUME(Pow)
      	rhs = $.SUBRULE2($.inlineAtom)
        evaluate(lhs, op, rhs)
      })

      return lhs
    })

    this.RULE("inlineAtom", ()=>{
      let atom 
      atom = $.OR([
        {ALT:()=>$.SUBRULE($.parenthesis)},
        {ALT:()=>$.SUBRULE($.quark)}
      ])
      return atom
    })

    this.RULE("parenthesis", ()=>{
      let exp, lparen, rparen

      lparen = $.CONSUME(LParen)
      exp = $.SUBRULE($.inlineExpression)
      rparen = $.CONSUME(RParen)
      return $.ACTION(()=>{
        const node = {
          startLine: lparen.startLine, startColumn: lparen.startColumn, 
          endLine:   rparen.endLine,   endColumn:rparen.endColumn,
        }
        Object.assign(lparen, {style: ['ClearMark'], node: rparen})
        Object.assign(rparen, {value: exp, node: node})
        return rparen
      })
    })

    this.RULE("aggregate", (lhsValue, padding)=> {
      let nl, seperator, sign, number, identifier
      //seperator = $.LA(0)
      nl = $.CONSUME(NewLine)
      //$.MANY(()=>$.CONSUME(NewLine))
      seperator = $.CONSUME(Seperator)
      $.CONSUME2(NewLine)      
      number = $.SUBRULE($.factor)

      $.OPTION(()=>{
        $.OR([
          { ALT: ()=>{
            $.CONSUME(ResultEqual)
            identifier = $.CONSUME(SuffixIdentifier)
            $.ACTION(()=>{
              const key = identifier.image
              if(key in this._vars){
                Object.assign(identifier, {style: ['Error'], tooltip: 'Already defined.'})
              }
              else if(
                lhsValue.toFixedDecimal() !== 
                number.value.toFixedDecimal()
              ){
                this._vars[key] = lhsValue
              }
              else{
                this._vars[key] = number.value
              }
            })
          }},
        ])
      })

      $.OPTION2(()=>$.CONSUME(Annotation))

      return $.ACTION(()=>{
        const node = {
          startLine: nl.startLine,     startColumn: nl.startColumn, 
          endLine:   number.endLine,   endColumn:number.endColumn,
        }
        //string comparison
        if(lhsValue.toLocaleString() !== number.value.toLocaleString()){
          Object.assign(number, {
            formatting: lhsValue.toLocaleString(), 
            style: 'Result',
          })
        }
        else {
          if(seperator.endColumn != number.endColumn){
              Object.assign(seperator, {
              formatting: '═'.repeat(number.endColumn),
              padding: -seperator.startColumn,
              ws: seperator.startColumn,
              style: 'Result',
            })
          }
          Object.assign(number, {type: TokenType.Block, style: ['Result'], node: node})
        }
        return number
      })
    })
    
    this.RULE("quark", ()=>{
      return $.OR([
        { ALT: ()=>$.SUBRULE($.factor) },
        { ALT: ()=>$.SUBRULE($.var) }
      ])
    })
    
    this.RULE("atom", ()=>{
      let number, perc
      number = $.SUBRULE($.quark)
      $.OPTION(()=>$.CONSUME(Annotation))      
      return number
    })

    this.RULE("var", ()=>{
      let negetive, identifier
      let lastToken = null, ast = []
      negetive = $.OPTION(()=>$.CONSUME(Minus))
      lastToken = $.LA(0)
      identifier = $.OR([
        { ALT: ()=>$.CONSUME(Identifier) },
        { ALT: ()=>$.CONSUME2(DefinedIdentifier) }
      ])
      return $.ACTION(()=>{
        const key = identifier.image
        let ws = identifier.startColumn

        if(lastToken) {
          let lines = identifier.startLine - lastToken.endLine
          ws = ws - (lines == 0 ? lastToken.endColumn : 0)
        }

        Object.assign(identifier, {
          ws: ws-1,
        })

        if(key in this._vars){
          const value = negetive ? -this._vars[key] : this._vars[key]
          Object.assign(identifier, {
            value: value,
            defined: true,
            style: negetive ? ['NegetiveLiteral']: [identifier.tokenType.name],
            tooltip: BigNum(value).toFixedDecimal(),
          })
        }  
        else {
          Object.assign(identifier, {
            value: BigNum(0.00),
            defined: false,
            style: ['Error'],
            tooltip: 'Undefined variable. Using 0.00 as value.'
          })
        }

        return identifier
      })
    
    })

    this.RULE("factor", ()=>{
      let negetive, number
      let lastToken = null

      negetive = $.OPTION(()=>$.CONSUME(Minus))
      lastToken = $.LA(0)
      number = $.CONSUME(NumberLiteral)
      /*number = $.OR([
        {ALT:()=> $.CONSUME(NumberLiteral)},
        {ALT:()=> $.CONSUME(Infinite)}
      ])*/

      return $.ACTION(()=>{
        let ws = number.startColumn
        if(!tokenMatcher(lastToken, EOF)) {
          let lines = number.startLine - lastToken.endLine
          ws = ws - (lines == 0 ? lastToken.endColumn : 0) 
        }
        //const value = negetive ? -BigNum(number.image) : BigNum(number.image)
        const value = negetive ? -number.payload.parse : number.payload.parse
        Object.assign(number, {
          value: value,
          style: value < 0 ? ['NegetiveLiteral'] : [number.tokenType.name], 
          ws: ws-1,
        })
        return number
      })
    })

    this.performSelfAnalysis()
  }
  
}

// reuse the same parser instance.
const parser = new TapeParser([])

function changeLocale(format){
  BigNumEnv.initLocale(format);
  regexpNumberLiteral = BigNumEnv.getNumeralMatcher();
}

export const QwikTape = {
  defaultRule: 'tape',
  lexer: TapeLexer,
  parser: parser,
  tokenMatcher: tokenMatcher,
  tokenType: TokenType,
  diagramBuilder: chevrotain.createSyntaxDiagramsCode,
  ERR: {NOALT: chevrotain.NoViableAltException},
  changeLocale: changeLocale,
}