export class Tabs extends Element
{
  recent = [];
  active = null;
  content;

  constructor(props) {
    super();
    this.recent = props.recent;
    this.activeId = props.activeId;
  }
  
  this(props) {
    Object.assign(this, props);
  }
  
  componentDidMount(){
    this.content = document.$("body");
    this.$("#bookmarks").paintBackground = this.paintName;
  }
  
  paintName(gfx){
   const clip = new Graphics.Path("M0 0 0 75 30 60 60 75 60 0");
   const text = new Graphics.Text("QwikTape ".repeat(8), "logo-background-text");
   gfx.pushLayer(clip);
   gfx.draw(text, {x: 0, y: 0, alignment: 7});
   gfx.popLayer();
  }
  
  get currentIndex(){
    const el = this.$('div[key][active=true]');
    return el.getAttribute("index");
  }
  
  ["on refresh"](evt, el){
    this.componentUpdate(evt.data);
  }

  ["on click at div[key]"](evt, el){
    this.content.postEvent( new Event("switch-tape", {data: el.getAttribute("key")}));
  }
  
  ["on ^click at #close[key]"](evt, el){
    this.content.postEvent( new Event("close-tape", {data: el.getAttribute("key")}));
    return true;
  }

  ["on click at #add"](evt, el){
    this.content.postEvent( new Event("add-tape"));
  }

  ["on click at #bookmarks"](evt, el){
    this.content.postEvent( new Event("browse-tapes"));
  }

  render(){
    return <window-caption role="window-caption" styleset={__DIR__ + "tabs.css#tabs"}>
      <button #bookmarks/>
      {this.recent?.map((tape, index)=>{
        return <div.shell-icon filename=".txt" index={index} key={tape.id} active={tape.id === this.activeId}>
          <span.name>{tape.name}</span>
          {this.recent.length > 1 && <button #close key={index}>&nbsp;</button>}
        </div>
      })}
    <button #add/>
    </window-caption>
  }
}