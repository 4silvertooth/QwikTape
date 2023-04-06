import { Color } from "color-picker.js"
export const themes = [
  {
    'editor-text' : '#3a3636',
    'editor-number' : '#0931f5',
    'editor-negation' : '#ff6347',
    'editor-annotation' : '#2895c0',
    'editor-result' : '#9b09f6',
    'editor-variable' : '#867caf',
    'editor-tooltip' : '#fff740',
    'editor-errors' : '#ff0000',
    'editor-paper' : '#fbfbf8',
  },
  {
    'editor-text': '#000000',
    'editor-number': '#0000FF',
    'editor-negation': '#ff6347',
    'editor-annotation': '#808080',
    'editor-result': '#800080',
    'editor-variable': '#a52a2a',
    'editor-tooltip': '#fff740',
    'editor-errors': '#ff0000',
    'editor-paper': '#fbfbf8',
  },
  {
    'editor-text': '#c2c299',
     'editor-number': '#e59337',
     'editor-negation': '#ff6347',
     'editor-annotation': '#f48771',
     'editor-result': '#cc833b',
     'editor-variable': '#9b90c3',
     'editor-tooltip': '#fff740',
     'editor-errors': '#ff0000',
     'editor-paper': '#2c3333',
  },
  {
    'editor-text' : '#3a3636',
    'editor-number' : '#0931f5',
    'editor-negation' : '#f94322',
    'editor-annotation' : '#c62a75',
    'editor-result' : '#3d0264',
    'editor-variable' : '#48425e',
    'editor-tooltip' : '#ac2eb8',
    'editor-errors' : '#ff0000',
    'editor-paper' : '#f1d1f6',
  },
  {
    'editor-text' : '#38382c',
    'editor-number' : '#14026f',
    'editor-negation' : '#a4200c',
    'editor-annotation' : '#6e6b6b',
    'editor-result' : '#131313',
    'editor-variable' : '#1c1c1f',
    'editor-tooltip' : '#66e8d4',
    'editor-errors' : '#ff0000',
    'editor-paper' : '#e0f9f9',
  },
]

export class Theme extends Element
{
  index;
  
  constructor(props){
    super();
    this.index = 0;
  }
  
  componentDidMount(){
    this.post(_=>{
      themes.unshift(this.value);
    });
  }
  
  ["on click at #previous"](evt, el){
    this.index = this.index <= 0 ? 0 : this.index - 1;
    this.componentUpdate({value: themes[this.index]});
    this.postEvent(new Event("change", {bubbles: true}));
  }

  ["on click at #next"](evt, el){
    this.index = this.index >= themes.length-1 ? themes.length-1 : this.index + 1;
    this.componentUpdate({value: themes[this.index]});
    this.postEvent(new Event("change", {bubbles: true}));
  }
  
  render(){
    return <div styleset={__DIR__+"theme.css#controls"}>
      <section>
        <button #previous disabled={this.index == 0} ></button>
        <button #next disabled={this.index >= themes.length-1}></button>
      </section>  
      <Color (editor-text)>Text</Color>
      <Color (editor-number)>Numbers</Color>
      <Color (editor-negation)>Negetive Numbers</Color>
      <Color (editor-result)>Results</Color>
      <Color (editor-variable)>Variables</Color>
      <Color (editor-annotation)>Annotations</Color>
      <Color (editor-tooltip)>Info Bubble</Color>
      <Color (editor-paper)>Paper</Color>
      <Color (editor-errors)>Errors</Color>
    </div>
  }

}