export class BrowseStorage extends Element
{
  list;
  current;

  constructor(props) {
    super();
    this.current = props.current;
    this.list = props.list;
  }
  
  this(props) {
    this.componentUpdate(props);
  }
  
  popupMenu(){
    return (
      <menu.popup styleset={__DIR__ + "browse-storage.css#popup-menu"}>
        <li #rename>Rename</li>
        <li #delete>Delete</li>
      </menu>
    );
  }
  
  ["on click at div[key]"](evt, el) {
    this.post( new Event("open-tape", {bubbles: true, data: el.getAttribute("key")}));
  }

  ["on ^click at div.context[key]"](evt, el) {
    this.popup = el.popup(Element.create(this.popupMenu()), {anchorAt: 9, popupAt: 7});
    //return true;
  }

  /*["on mouseleave"](evt, el) {
    if(this && this.popup) {
      this.popup.state.popup = false;
      this.popup = null;
    }
  }*/

  ["on change at :root > div[key] > input[index]"](evt, el){
    const index = evt.source.getAttribute("index");
    const tape = this.list[index];
    if(!tape) return;
    this.list[index].name = el.value;
    this.postEvent(new Event('rename-tape', { bubbles: true, 
      data: {
        tape: tape,
        name: el.value,
      }})
    );
  }
  
  ["on keydown at :root > div > input"](evt, el){
    if(evt.code !== "Enter" && evt.code !== "NumpadEnter" && evt.code !== "Escape") return;
    this.componentUpdate({renaming: null});
  }
  
  ["on blur at :root > div > input"](evt, el){
    if(evt.reason == 0){ //fix: no input on rename
      this.$("input").state.focus = true;
      return;
    }
    this.componentUpdate({renaming: null});
  }

  ["on ^click at menu.popup > #rename"](evt, el){
    this.popup.state.popup = false;
    this.popup = null;
    const key = evt.source.getAttribute("key");
    const index = evt.source.getAttribute("index");
    this.componentUpdate({renaming: key});
    if(this.renaming){
      this.post(()=>{
        this.$("input").state.focus = true;
      });  
    }
  }

  ["on ^click at menu.popup > #delete"](evt, el){
    this.popup.state.popup = false;
    this.popup = null;
    const key = evt.source.getAttribute("key");
    const index = evt.source.getAttribute("index");
    this.componentUpdate({deleting: key});
    let reply = Window.this.modal(
      <alert caption={this.list[index].name}>
        <content>Deleting {this.list[index].name}?</content>
        <buttons>
           <button id="yes" role="default-button" accesskey="!KeyY">Yes</button>
           <button id="no" role="cancel-button" accesskey="!KeyN">No</button>
        </buttons>
      </alert>
    );
    
    if(reply === "yes") {
      this.post( new Event("delete-tape", {bubbles: true, data: key}));
      return true;
    }
    
    this.componentUpdate({deleting: null});
    return;
  }
    
  render(){
    return <section.files styleset={__DIR__ + "browse-storage.css#browse-storage"}>
      {this.list.map((tape, index)=>{
        return <div key={tape.id} current={tape.id == this.current} deleting={tape.id === this.deleting}>
          <div.file>
            <div.content.middle>{tape.text ? tape.text.split(/\r*\n/).slice(-4).join("\n") : "Type Something"}</div>
            <div.context index={index} key={tape.id}/>
          </div>
          {tape.id === this.renaming ? <input index={index}>{tape.name}</input> : <div.name>{tape.name}</div>}
        </div> 
      })}
    </section>
  }  
}