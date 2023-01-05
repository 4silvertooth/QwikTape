export class ColorPicker extends Element
{
  color;
  constructor(props) {
    super();
    const color = props.color.hsv;
    console.log(typeof color, color);
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
    return <menu.popup styleset={__DIR__ + "color-picker.css#picker"}>
      <widget role='menu-item'>
        <div #palette/>
        <div #marker/>
      </widget>  
      <div #hue min=0 max=360 value={this.color.h} styleset={__DIR__ + "color-picker.css#hue"}></div>
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
  
  hexToRGB(hex){
    return [ hex >> 16, hex >> 8 & 0xFF, hex & 0xFF ]; 
  }

  //RGB = #000000 - #ffffff
  luminance(RGB){
    const [r, g, b] = this.hexToRGB(Number(`0x${RGB.substring(1)}`));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  }
  
  contrast(RGB1, RGB2){
    const lum1 = this.luminance(RGB1);
    const lum2 = this.luminance(RGB2);
    return Math.max(lum1, lum2) / Math.min(lum1, lum2)
  }
  
  set value(v){
    this.style.setProperty('background', v);
    this.style.setProperty('color',this.luminance (v) < 127.5 ? '#fbfbf8' : '#000000');
    this.color = v;
  }
  
  get value(){
    return this.color.toString();
  }
  
  ["on select-color"](evt, el){
    this.color = evt.data.toString();
    this.postEvent(new Event('change', {bubbles: true}));
    return true;
  }
  
  ["on click at :root:owns-popup"](evt, el){
    return true;
  }

  ["on click at :root"](evt, el){
    const color = this.style.colorOf('background-color');
    const picker = <ColorPicker color={color}/>;
    this.popup(picker, {
      anchorAt: 7, 
      popupAt:3,
    });
  }
  
  render(){
    return <div>{this.label}</div>
  }  
}