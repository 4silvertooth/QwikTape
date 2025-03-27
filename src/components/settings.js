import { Theme } from "theme.js"

//locale refrence https://en.wikipedia.org/wiki/Decimal_separator

export class SettingsForm extends Element
{
  formData;
  supportedLocale = [
    "1234567.89",
    "1234567,89",
    "1,234,567.89",
    "1.234.567,89",
    "1 234 567.89",
    "1 234 567,89",
    "12,34,567.89",
    "12 34 567.89",
    "1'234'567.89",
    "1'234'567,89",
    "1.234.567'89",
    "1˙234˙567.89",
    "1˙234˙567,89",
    "12,34,567·89",
  ];

  constructor(props){
    super();
    this.formData = props.formData;
  }
  
  this(props){
    this.formData = props.formData;
  }
  
  ["on change at :root > form > select"](evt, el){
    return true;
  }

  ["on change at :root > form"](evt, el){
    this.postEvent(new Event('settings-changed', {bubbles: true, data: el.value}));
    return true;
  }
  
  ["on click at :root > button#close"](evt, el){
    this.postEvent(new Event('settings-close', {bubbles: true}));
    return true;    
  }
  
  render(){
    return <section.settings styleset={__DIR__+"settings.css#settings-form"}>
      <button#close/>
      <form value={this.formData}>
        <label>Number of decimal digits.</label>
        <input|integer min=0 max=50 step=1 (decimalDigits)/>

        <label>Indent or padding.</label>
        <input|integer min=0 max=30 step=1 (padding)/>
        
        {/*<label>Number Format</label>
        <select as='auto' (locale)>
         { this.supportedLocale.map((entity) => <option>{entity}</option>) }
        </select>*/}

        <label>Replace operator / and * with ÷ and × in editor?</label>
        <select as='auto' (replaceOperator)>
          <option value={true}>YES</option>
          <option value={false}>NO</option>
        </select>

        <label>Press ESC to clear tape content?</label>
        <select as='auto' (escToClear)>
          <option value={true}>YES</option>
          <option value={false}>NO</option>
        </select>

        <label>Use wordwrap?</label>
        <select as='auto' (wordwrap)>
          <option value={true}>YES</option>
          <option value={false}>NO</option>
        </select>

        <label>Editor color theme.</label>
        <Theme (colors)/>
      </form>
    </section>
  }
}