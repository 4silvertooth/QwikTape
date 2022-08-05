import { QwikTape } from "../parser/tape-embedded.js";
const { lexer, parser, tokenType, tokenMatcher, ERR } = QwikTape;

export class Editor extends Element {
  ast;
  lex;
  tape;
  settings;

  constructor(props) {
    super();
    this.tape = props.tape;
    this.settings = props.settings;
    this.lex = {};
    this.ast = [];
  }
  
  this(props, children, parent){
    const lastId = this.tape.id;
    this.tape = props.tape;
    this.settings = props.settings; 
    if(this.tape) {
      this.value = this.tape.text;
      this.postEvent(new Event("change", {bubbles: true}));
      if(lastId !== this.tape.id) //set caret if new document 
        this.post(()=>{
          this.state.focus = true;
        });
    }
    if(props.settings.colors){
      this.style.variables(props.settings.colors);
    }
  }

  componentDidMount() {
    if(this.tape) {
      this.state.focus = true;
      this.value = this.tape.text;
      this.postEvent(new Event("change", {bubbles: true}));
    }
    this.onGlobalEvent("debug-show-parse", this.debugCallback );    
  }
  
  debugCallback(evt){
    if(!evt.data) return;
    const result = { 
      lex: this.lex ?? '', 
      ast: this.ast ?? '', 
      parseErrors: parser.errors,
    };
    this.post(new Event("log", {bubbles: true, data: JSON.stringify(result, null, "  ")}));
  }
  
  clearMark(line, startColumn, endColumn) {
    const range = new Range();
    range.setStart(line, startColumn);
    range.setEnd(line, endColumn);
    range.clearHighlight(range.marks());
  }

  mark(token, markType=null) {
    if(!markType){
      markType = token.style ?? [token.tokenType.name];
    }
    let {startLine, endLine, startColumn, endColumn} = token;

    const startNode = this.children[startLine-1]?.firstChild;
    if(!startNode) return;

    if(markType.includes('ClearMark')){
      if(token.node){
        const clearNodeRange = new Range();
        clearNodeRange.setStart(startNode, startColumn);
        clearNodeRange.setEnd(startNode, token.node.endColumn);
        if(clearNodeRange.marks().includes('Error')){
          clearNodeRange.clearMark('Error');
        }
      }
      return;
    }

    if(markType.includes('Error')){
      if(token.node){
        endLine = token.node.startLine;
        endColumn = token.node.startColumn;
      }
    }

    const range = new Range();      
    const endNode = this.children[endLine-1].firstChild;
    range.setStart(startNode, startColumn-1);
    range.setEnd(endNode, endColumn);
    range.clearMark(range.marks());
    range.highlight(markType);
    
    range.setStart(startNode, 0);
    range.setEnd(startNode, startNode.textContent.length);
    if(range.marks().includes('Error')){
      startNode.parentElement.setAttribute('Error', true);
    }
    else if(startNode.parentElement.hasAttribute('Error')){
      startNode.parentElement.removeAttribute('Error');
    }
  }
  
  insertNewLineBefore(token){
    this.plaintext.update( (transact) => {
      this.plaintext.selectRange(token.startLine-1, token.startColumn-1, token.startLine-1, token.startColumn-1);
      transact.execCommand('edit:insert-break');
      transact.execCommand('navigate:line-end');
      //this.plaintext.selectRange(token.startLine, 1, token.startLine, 1);
      return true;
    });
  }
  
  parseTape(text){
    this.lex = lexer.tokenize(text);
    parser.input = this.lex.tokens;
    this.ast = parser.tape(this.settings);
    return [this.lex.tokens, this.ast, parser.errors];
  }
  
  //todo: find a way to count how many tokens to skip
  //right now it assumes only past 2 tokens to be dirty
  //before the caret after any input
  //and all other tokens after caret are dirty or has changed
  //theoretically it should be the maximum number tokens possible
  //between new line token, not counting white space

  evalTokens(tokens){
    let [caretLine, offset] = this.plaintext.selectionStart;
    const lastIndex = tokens.findIndex((token)=>{
      let lineEditable = caretLine !== token.startLine-1; //|| token.startColumn > offset
      if(lineEditable){
        if(token.formatting || token.padding){
          this.formatToken(token);
          return true;
        }
      }
      if(token.onNewLine){
        this.insertNewLineBefore(token);
        return true;
      }
      if(!tokenMatcher(token, tokenType.NewLine)){
        this.mark(token);
      }
    });

    if(lastIndex < 0 || lastIndex >= tokens.length) 
      return;

    const [newTokens] = this.parseTape(this.value);
    const skip = 2
    const remaining = newTokens.slice(lastIndex < skip ? 0 : lastIndex - skip);
    this.evalTokens(remaining);
  }
  
  padToken(token){
    const line = this.children[token.startLine-1].firstChild;
    const startColumn = token.startColumn-1;
    if(token.ws + token.padding <= 0) return;
    const text = line.textContent.substring(0, startColumn - token.ws) +
                  printf("%*s",token.ws + token.padding, ' ') +
                  line.textContent.substring(startColumn, line.textContent.length)
    this.plaintext.update( (transact)=>{
      transact.setText(line, text);
      return true;
    })    
  }
  
  replace(lineNode, fromPos, toPos, padding, withText){
    let prefix, text, suffix;
    padding = Math.max(0, padding);
    prefix = lineNode.textContent.substring(0, fromPos);
    text = ' '.repeat(padding) + withText;
    suffix = lineNode.textContent.substring(toPos, lineNode.textContent.length);
    return prefix + text + suffix;
  }
  
  formatToken(token){ //indent and format
    const value = token?.formatting; //it can be just padding
    const lineNode = this.children[token.startLine-1].firstChild;
    const startColumn = token.startColumn-1;
    const fromPos = startColumn - token.ws;
    const toPos = value ? token.endColumn : startColumn;
    this.clearMark(lineNode, fromPos, toPos + (value?.length ?? 0) );
    const text = this.replace(lineNode, fromPos, toPos, token.ws + ( token.padding || 0 ), value ?? '');
    this.plaintext.update( (transact)=>{
      transact.setText(lineNode, text);
      return true;
    })
  }
  
  eraseToken(token){
    const fromLine = this.children[token.startLine-1].firstChild;
    const toLine = this.children[token.endLine-1].firstChild;
    this.plaintext.update((transact)=>{
      let [lineNode, offset] = transact.deleteRange(fromLine, token.startColumn-1, toLine, token.endColumn);
      const lineNo = lineNode.parentElement.elementIndex;
      this.plaintext.selectRange(lineNo, offset, lineNo, offset);
      return true;
    });
  }
  
  filterTokens(tokens, filter){
    if(filter == tokenType.Tooltip){
      return tokens.filter((token)=>token.tooltip);
    }
    return tokens.filter((token)=>token.type == filter);
  }
  
  getTokenUnderCaret(fromTokens, caret) {
    if(!fromTokens) return;
    let [caretLine, caretColumn] = caret ?? this.plaintext.selectionStart;
    caretLine += 1;

    return fromTokens.find((token)=>{
      const node = token.node ?? token;
      if(caretLine >= node.startLine && caretLine <= node.endLine ){
        if(node.startLine == node.endLine) {
          if(caretColumn < node.startColumn) return
          if(caretColumn > node.endColumn) return
          return token;
        }
        else if(node.startLine !== node.endLine){
          if(caretLine == node.startLine && caretColumn < node.startColumn) return;
          if(caretLine == node.endLine && caretColumn > node.endColumn) return;
          return token;
        }
      }
    })
  }

  insertResult(token){
    let { value, node, padding } = token;
    const text = printf("%*s",padding, value);
    const seperator = "═".repeat(padding);
    const seperatorNode = this.children[node.startLine].firstChild;
    
    this.plaintext.update((transact)=>{
      transact.setText(seperatorNode, seperator);
      this.plaintext.selectRange(node.startLine, seperator.length, node.startLine, seperator.length)
      transact.execCommand('edit:insert-break');
      const result = this.children[node.startLine+1].firstChild;
      transact.setText(result, text);
      return true;
    });
    
    this.plaintext.selectRange(node.startLine+1, text.length, node.startLine+1, text.length);
    this.postEvent(new Event("change", {bubbles: true}));
  }
  
  replaceChar(lineNo, textNode, offset, symbol){
    this.plaintext.update( (transact) => {
      transact.deleteRange(textNode, offset-1, textNode, offset);
      transact.insertText(textNode, offset-1, symbol);
      //transact.execCommand("edit:insert-text", symbol);
      return true;
    });
      this.plaintext.selectRange(lineNo, offset, lineNo, offset);
  }
  
  ["on save-update"](evt, editor){
    this.tape.text = this.value;
  }
  
  ["on mouseidle at :root"](evt, el) {
    //bug: if mark at end of line rangeFromPoint 
    //will be last mark even on blank space after mark
    const range = this.rangeFromPoint(evt.x, evt.y);
    if( !range ) return;
    //todo: negation Variable are filterd, 
    //as the token changes to NegetiveLiteral 
    const requiredNode = range.marks()
      .filter((key)=>["Error", "Identifier", "Variable"].includes(key))
      .length;
    if(this.shownPopup) {
      if(!requiredNode) {
        this.shownPopup.state.popup = false;
      }  
      return true;
    }

    if( !requiredNode ) return;

    const tooltips = this.filterTokens(this.lex.tokens, tokenType.Tooltip);
    const toolTipToken = this.getTokenUnderCaret(
      tooltips, [range.startContainer.parentElement.elementIndex, range.startOffset+1]
    );
    if(!toolTipToken) return;
    const tooltip = <popup.tooltip>{toolTipToken.tooltip}</popup>;
    const position = {x: evt.windowX, y: evt.windowY };
    this.shownPopup = this.popup(tooltip, position);

    return true;
  }

  ["on popupdismissing"](evt) {
    this.shownPopup = null;
  }
      
  ["on checkForResults"](evt, editor){
    let [startLine, startColumn] = evt.data;
    //the tokens have changed after formatting recalculating last caret position
    const lineNode = this.children[startLine];
    if(this.ast){
      const inserts = this.filterTokens(this.ast, tokenType.Insert);
      const token = this.getTokenUnderCaret(inserts, [startLine, lineNode.textContent.length+1])
      if(token) this.insertResult(token);
    }
  }
  
  ["on keyup at :root"](evt, editor){
    if(evt.code === 'ArrowUp' || evt.code === 'ArrowDown'){
      this.postEvent( new Event('change', {bubbles: true}) );
    }    
  }
  
  ["on ^keydown at :root"](evt, editor){
    const allowedKeys = ['Enter', 'NumpadEnter', 'Backspace', 'Delete'];
    if(!allowedKeys.includes(evt.code)) return;
    
    if(evt.code === 'Enter' || evt.code === 'NumpadEnter'){
      this.postEvent( new Event('checkForResults', { bubbles: true, data:this.plaintext.selectionStart }) );
      return;
    }

    if(evt.code === 'Backspace' || evt.code === 'Delete'){
      if(this.plaintext.selectionText) return;
      const blocks = this.filterTokens(this.lex.tokens, tokenType.Block)
      let token = this.getTokenUnderCaret(blocks);
      if(token){
        this.eraseToken(token.node);
        return true;
      }
    }
  }

  // evt.reason
  // const CHANGE_BY_INS_CHAR = 0;  // single char insertion
  // const CHANGE_BY_INS_CHARS = 1; // character range insertion, clipboard
  // const CHANGE_BY_DEL_CHAR = 2;  // single char deletion
  // const CHANGE_BY_DEL_CHARS = 3; // character range deletion (selection)
  // const CHANGE_BY_UNDO_REDO = 4;
  // const CHANGE_BY_INS_CONSECUTIVE_CHAR = 5; // single char insertion, previous character was inserted in previous position  
  // const CHANGE_BY_CODE = 6; 
  
  ["on ^change at :root"](evt, editor){
    if(evt.reason == 4) return;
    if((evt.reason == 5 || evt.reason == 1) && this.settings.replaceOperator == true) {
      let [line, offset] = editor.plaintext.selectionStart;
      const textNode = editor.children[line]?.firstChild;      
      const op = textNode.textContent.charAt(offset-1);
      switch(op){
        case '*':
          this.replaceChar(line, textNode, offset, '×');
          break;
        case '/':
          this.replaceChar(line, textNode, offset, '÷');
          break;
      }
    }
    
    let [tokens, ast] = this.parseTape(editor.value)
    this.evalTokens(tokens);
    this.post(new Event("save-update", {bubbles: true}), true);
    
    parser.errors.map((error)=>{
      //console.log(error, error.token, error.previousToken)
      if(error instanceof ERR.NOALT) {
        //Object.assign(error.previousToken, {tooltip: error});
        //this.mark(error.previousToken, ['Error']);
        return;
      }
      try {
        Object.assign(error.token, {tooltip: error});
      }
      catch(e){
        //todo: sometimes the object is not extensible
        console.log(e);
      }
      this.mark(error.token, ['Error']);
    })
    
  }
  
  render(){
    return <plaintext styleset={__DIR__ + "editor.css#editor"} id='tape'/>
  }
}
