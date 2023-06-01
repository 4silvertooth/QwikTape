import { loadLibrary } from "@sciter";
import { launch } from "@env";
import * as sciter from "@sciter";
import * as ENV from "@env";
import * as SYS from "@sys";

const PDF = loadLibrary("sciter-pdf");

const hasPdf = ()=>{
  try {
    return typeof PDF === 'object' ? true : false;
  }
  catch(e){
    return false;
  }
}

const env = {
  height: 0,
  width: 0,
  charWidth: 0, 
  lineSpacing: 18,
  onPage: 1, 
  atLine: 0,
  marginLeft: 20,
  marginRight: 20,
  marginTop: 20,
  marginBottom: 20,
  errorStack: [],
  colors: {}
};

const getLineCoordinates = (token)=>{
  const { startColumn, startLine} = token;
  const left = env.marginLeft + (startColumn * env.charWidth);
  const top = env.height - env.marginTop - ((startLine - env.atLine) * env.lineSpacing);
  const right = env.width - env.marginLeft + env.marginRight;
  const bottom = env.height - env.marginTop - ((startLine - env.atLine) * env.lineSpacing) - env.lineSpacing;
  return {left, top, right, bottom};
}

const getNodeCoordinates = (token)=>{
  const { startColumn, startLine, endColumn, endLine } = token;
  const { endColumn: nodeEndColumn } = token.node;
  
  const left = env.marginLeft + (startColumn * env.charWidth);
  const top = env.height - env.marginTop - ((startLine - env.atLine) * env.lineSpacing);
  const right = left + ( (nodeEndColumn - startColumn) * env.charWidth);
  const bottom = env.height - env.marginTop - ((startLine - env.atLine) * env.lineSpacing) - env.lineSpacing;
  return {left, top, right, bottom};
}

const getTextCoordinates = (token)=>{
  const { startColumn, startLine, endColumn, endLine } = token;
  const left = env.marginLeft + (startColumn * env.charWidth);
  const top = env.height - env.marginTop - ((startLine - env.atLine) * env.lineSpacing);
  const right = left + (token.image.length * env.charWidth);
  const bottom = env.height - env.marginTop - ((startLine - env.atLine) * env.lineSpacing) - env.lineSpacing;
  return {left, top, right, bottom};
}

const DrawToken = (page, token, color)=>{
  //const haruColor = typeof color == String ? new Graphics.Color(color) : color;
  if(env.errorStack.length == 0){
    page.setRGBFill(color.r, color.g, color.b);
  }
  else {
    color = env.colors['editor-errors'];
    page.setRGBFill(color.r, color.g, color.b);
  }
  page.textRect(
    getTextCoordinates(token),
    token.image,
    page.TALIGN_LEFT
  );
}

const DrawErrorLine = (page, token, color)=>{
  page.endText();
  page.setDash();
  page.setRGBStroke(color.r, color.g, color.b);
  const cords = getTextCoordinates(token);
  page.moveTo(cords.left,cords.bottom + 5);
  if(token.tokenType.name === 'LParen' && token.hasOwnProperty('node')){
    const endCords = getNodeCoordinates(token);
    page.lineTo(endCords.right, endCords.bottom + 5);
  }
  else {
    page.lineTo(cords.right, cords.bottom + 5);
  }  
  page.stroke();
  page.beginText();
}

const addStyledPaper = (colors)=>{
  const page = PDF.addPage();
  page.setSize(page.SIZE_A4, page.PORTRAIT);
  env.height = page.getHeight();
  env.width = page.getWidth();
  env.errorStack = [];
  
  const paper = colors['editor-paper'];
  page.setRGBFill(paper.r, paper.g, paper.b);
  page.rectangle(0, 0, env.width, env.height);
  page.fill();

  page.setGrayStroke(0.9);
  for(var i = env.lineSpacing; i <= env.height ; i += env.lineSpacing){
    page.moveTo(env.marginLeft - 10, env.height - i);
    page.lineTo(env.width - env.marginRight + 10, env.height - i);
    page.stroke();
  }

  return page;
};

const getTokenType = (token)=>{

  if(token.tokenType.name === 'LParen'){
    if(token.hasOwnProperty('node') && token.node.hasOwnProperty('style')){
      if(token.node.style[0] === 'ErrorLiteral'){
        env.errorStack.push(token);
        return token.node.style[0];
      }
    }
  }

  if(token.tokenType.name === 'RParen'){
    if(token.hasOwnProperty('node') && token.hasOwnProperty('style')){
      if(token.style[0] === 'ErrorLiteral'){
        env.errorStack.pop();
        return token.style[0];
      }
    }
  }
  if(token.hasOwnProperty('style')){
    return token.style[0];
  }
  return token.tokenType.name;
}

const onNewPage = (token)=>{
  if( (token.startLine - env.atLine) * env.lineSpacing + env.lineSpacing > env.height - env.marginBottom){
    return true;
  }
  return false;  
}

const getFontPaths = (OS)=>{
  
  switch(OS){
    case 'Windows': {
      const fontsPath = `${SYS.getenv("windir")}\\Fonts\\`;
      return [`${fontsPath}consola.ttf`,`${fontsPath}consolab.ttf`,`${fontsPath}consolai.ttf`];
    } break;
    case 'Linux': {
      const fontsPath = `/usr/share/fonts/truetype/dejavu/`;
      return [`${fontsPath}DejaVuSansMono.ttf`,`${fontsPath}DejaVuSansMono-Bold.ttf`,`${fontsPath}DejaVuSansMono.ttf`];
    } break;
    case 'OSX': {
    } break;
    default:
    break;
  }  
}

function toPdf(val, fileName){
  const { tokens, size } = val;

  const editor = document.$('plaintext');
  const { themes } = sciter.import("../components/theme.js");
  const colors = {...themes[0]};
  Object.keys(colors).forEach((key)=>{
    colors[key] = editor.style.variable(key);
  });
 
  env.atLine = 0;
  env.onPage = 1;
  env.colors = colors;
  
  PDF.newDoc();
  let page = addStyledPaper(colors);
  const [monospace, monospaceBold, monospaceItalic] = getFontPaths(ENV.PLATFORM); 
  const regular = PDF.getFont(PDF.loadTTFontFromFile(monospace, true), "UTF-8");
  const bold = PDF.getFont(PDF.loadTTFontFromFile(monospaceBold, true), "UTF-8");
  const italic = PDF.getFont(PDF.loadTTFontFromFile(monospaceItalic, true), "UTF-8");

  const fontSize = 10;
  page.setFontAndSize(regular, fontSize);
  //page.setFontAndSize(regular, fontSize);
  env.charWidth = (regular.getUnicodeWidth("H") + 1) * fontSize / 1000;
  page.beginText();

  tokens.map((token, index)=>{
    if(onNewPage(token)){
      page.endText();
      page = addStyledPaper(colors);
      env.atLine = token.startLine;
      page.beginText();
    }
    page.setFontAndSize(regular, fontSize);
    switch(getTokenType(token)){
      case 'Text':
        DrawToken(page, token, colors['editor-text']);
      break;
      case 'Annotation':
        page.setFontAndSize(italic, fontSize);
        DrawToken(page, token, colors['editor-annotation']);
      break;
      case 'Equal': 
      case 'Identifier': 
      case 'SuffixIdentifier':
        DrawToken(page, token, colors['editor-variable']);
      break;
      case 'Variable':
        page.setFontAndSize(bold, fontSize);
        DrawToken(page, token, colors['editor-variable']);
      break;
      case 'DefinedIdentifier': 
      case 'UndefinedIdentifier': 
      case 'Error':
        DrawToken(page, token, colors['editor-errors']);
        DrawErrorLine(page, token, colors['editor-errors']);
      break;  
      case 'NumberLiteral':
      case 'Operator':
        DrawToken(page, token, colors['editor-number']);
      break;
      case 'ErrorLiteral':
        DrawToken(page, token, colors['editor-errors']);
        DrawErrorLine(page, token, colors['editor-errors']);
      break;  
      case 'NegetiveLiteral':
        DrawToken(page, token, colors['editor-negation']);
      break;  
      case 'Seperator':
      case 'Result':
        DrawToken(page, token, colors['editor-result']);
      break;
      default:
        if(token.tokenType.name !== 'NewLine'){
          DrawToken(page, token, colors['editor-text']);
        }  
      break;
    }
  })
  page.endText();
  PDF.save(fileName);
  launch(fileName); 
}

export { toPdf, hasPdf }
