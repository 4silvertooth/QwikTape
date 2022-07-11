import * as debug from "@debug";

export class ColorPicker extends Element
{
  color;
  constructor(props) {
    super();
    const color = props.color.hsv;
    this.color = {h: color[0], s: color[1], v: color[2]};
  }
  
  componentDidMount(){
    this.style.variables({'hue-color': this.color.h});
    const palette = this.$('#palette');
    const marker = this.$('#marker');
    this.post(()=>{
      const [w,h] = palette.state.box("dimension");
      marker.style.set({
        left: w * this.color.s,
        top: h - h * this.color.v,
      });
    });
  }

  //click event won't have x,y cordinates of cursor
  ["on mousedown at :root > widget"](evt, el){
    const [w,h] = el.state.box("dimension");
    const hue = this.$("#hue").value;
    const s = evt.x / w;
    //const l = (0.5 * (1 - s) + 0.5) * (1 - (evt.y / h)); //for hsl
    const v = 1 - evt.y / h;
    const color = Graphics.Color.hsv(hue, s, v);
    /*//no change visible, as popoup will close
    const marker = this.$('#marker');
    marker.style.set({
      left: evt.x,
      top: evt.y,
    });
    */
    this.postEvent(new Event('select-color', {bubbles: true, data: color}));
  }

  ["on change at :root > #hue"](evt, el){
    this.style.variables({'hue-color': el.value});
    return true;
  }

  render(){
    return <menu.popup styleset={__DIR__ + "settings.css#picker"}>
      <widget role='menu-item'>
        <div #palette/>
        <div #marker/>
      </widget>  
      <div #hue min=0 max=360 value={this.color.h} styleset={__DIR__ + "settings.css#hue"}></div>
    </menu>;
  }  
}

export class Color extends Element
{
  label;
  constructor(props, kids){
    super();
    this.label = kids;
  }
  
  set value(v){
    this.style.setProperty('background', v);
    //this.componentUpdate({color: v})
    this.color = v;
  }
  
  get value(){
    return this.color.toString();
  }
  
  ["on select-color"](evt, el){
    //this.componentUpdate({color: evt.data.toString()});
    this.color = evt.data.toString();
    this.postEvent(new Event('change', {bubbles: true}));
    return true;
  }
  
  ["on click at :root:owns-popup"](evt, el){
    return true;
  }

  ["on click at :root"](evt, el){
    const color = this.style.getPropertyValue('background-color');
    this.popup(<ColorPicker color={color}/>, {
      anchorAt: 7, 
      popupAt:3,
    });
  }
  
  render(){
    return <div>{this.label}</div>
  }  
}

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
  
  render(){
    return <section.settings styleset={__DIR__+"settings.css#settings-form"}>
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