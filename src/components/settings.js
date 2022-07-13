import { Color } from "color-picker.js"

export class SettingsForm extends Element
{
  formData;

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
        <input|integer min=0 max=50 step=1 (precision)/>
        
        <label>Indent or padding.</label>
        <input|integer min=0 max=30 step=1 (padding)/>

        <label>Replace operator / and * with ÷ and × in editor?</label>
        <select (replaceOperator)>
          <option as='auto' value={true}>YES</option>
          <option as='auto' value={false}>NO</option>
        </select>
        <label>Editor colorization.</label>
        <div (colors)>
          <Color (editor-text)>Text</Color>
          <Color (editor-number)>Numbers</Color>
          <Color (editor-negation)>Negetive Numbers</Color>
          <Color (editor-annotation)>Annotations</Color>
          <Color (editor-variable)>Variables</Color>
          <Color (editor-result)>Results</Color>
          <Color (editor-tooltip)>Tooltips</Color>
        </div>  
      </form>
    </section>
  }
}