import * as DB from "@storage"; 
import * as Env from "@env";
import * as Sciter from "@sciter";

function initDb(storage) { 
  storage.root = {
    version: 1,
    tapeById: storage.createIndex("string", true),
    tapeByTimeStamp: storage.createIndex("date", true),
    last: null,
    recent: [],
    settings: {
      precision: 2, 
      padding: 10,
      replaceOperator: true,
      colors: {
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
    } 
  }
  seed(storage);
  return storage.root;
}

function migrate(root){
  console.log("migrate", root);
  for(var tape of root.tapeByTimeStamp){
    console.log("timeStamp", tape);
  }
  storage.commit();
}


let storage = DB.open(Env.path("documents") + "/qwiktape.db");
let root = storage.root || initDb(storage);
migrate(root);

document.on("beforeunload", function(evt, el){
  storage.commit();
  root = undefined;
  storage.close();
  storage = undefined;
});

export class Storage {
  id;
  name;
  timeStamp;
  text;

  constructor(text) {
    this.id = Sciter.uuid();
    this.name = printf("My Tape - %d", root.tapeById.length);
    this.timeStamp = new Date();
    this.text = text;

    root.tapeById.set(this.id, this);
    root.tapeByTimeStamp.set(this.timeStamp, this);
    root.last = this;
    if(!root.recent.includes(this)){
      root.recent.push(this);
    }
    document.post( new Event("new-tape", {bubbles:true, data: this}) );
  }
  
  save(text){
    if(text){
      this.text = text;
    }
    storage.commit();
  }
  
  rename(newName){
    this.name = newName;
  }
  
  static closeIndex(index){
    const removed = root.recent.splice(index, 1);
    //storage.commit();
    if(root.recent.length == 0){
      for(var tape of root.tapeByTimeStamp){
        root.last = tape;
        root.recent.push(tape)
        return root.last;
      }
    }
    if(removed[0].id === root.last.id){
      root.last = root.recent[index == 0 ? 0 : index-1];
    }  
    return root.last;
  }
  
  static saveCurrent(text){
    const entity = Storage.currentTape();
    if(entity){
      entity.text = text;
      storage.commit();
    }  
  }
  
  static rename(tape, text){
    tape.name = text || "unnamed";
  }
  
  static delete(id){
    const entity = this.getById(id);
    if(entity.freeze) return entity;

    const index = root.recent.findIndex((tape)=>tape.id == entity.id);
    const nowOpen = this.closeIndex(index);
    root.tapeByTimeStamp.delete(entity.timeStamp);
    root.tapeById.delete(entity.id);
    return nowOpen;
  }
  
  static instanceOf(entity){
    if(!entity || !('id' in entity)) throw "Tape should have ID.";
    const tapeEntity = root.tapeById.get(entity.id);
    if(!tapeEntity) throw "Not a valid tape.";
    return tapeEntity;
  }
  
  static currentTape(){
    if(root.last){
      return root.last;
    }   
  }

  static lastId(){
    /*if(!root.last){
      for(var tape in root.tapeByTimeStamp){
        root.last = tape;
        return tape.id;
      }
    }*/
    if(root.last){
      return root.last.id;
    }
  }

  static getById(id){
    const entity = Storage.instanceOf({id: id});
    root.last = entity;
    if(!root.recent.includes(entity)){
      root.recent.push(entity);
    }  
    return entity;
  }
  
  static recent(){
    return [...root.recent];
  }

  static all(){
    //return root.tapeByTimeStamp;
    const tapes = [];
    for(var tape of root.tapeByTimeStamp){
      tapes.push(tape);
    }    
    return tapes;
  }
  
  static getSettings(){
    return root.settings;
  }

  static saveSettings(value){
    function save(source, target){
      Object.keys(target).map((key)=>{
        if(typeof value[key] === 'object'){
          save(source[key], target[key]);
        }
        else {
          if(source[key] !== target[key]){
            source[key] = target[key];
          }
        }  
      });
    }
    save(root.settings, value);
  }
}

function seed(storage){
  const helpTape = {
    id: Sciter.uuid(),
    name: "Introduction",
    timeStamp: new Date(),
    freeze: true,
    text: 
`Welcome,

This is a QwikTape document,
Do calculations easily, neatly with auto indent 
and formatting,

      300.00 my last balance
-       5.22 food 
════════════
      294.78 this is my new balance


income = 2200 assign values to a variable name

      294.78 
+     income
════════════
     2494.78 = balance assign results to variable

     balance     using varialbe from above
-      25.00% ⥱ 623.70 damn high taxes
════════════
     1871.09 
-      50.00 continue calculations
-      20.00 
════════════
     1801.09 

Try changing the value of variable 'income' above,
all following values will recalculate.

pi =  3.141592653
radius = 5

Assign expression to a variable, it will follow 
rules of operator precedence,
area = pi × radius ^ 2 

        area hover cursor over variable name
+     600.00
════════════
      678.54
÷       0.00 hover cursor over errors
-    -100.00 subtract negetive numbers
════════════
      778.54 erroneous operations skipped

Document is auto saved. Use the bookmark menu on top left to find all
the documents added.

Start by creating a new document, using the [+] button on the title bar. 


`
,
    }

  const testTape = {
    id: Sciter.uuid(),
    name: "Tests",
    timeStamp: new Date(helpTape.timeStamp.valueOf()+1000),
    freeze: false,
    text: 
`Some tests,

test1 = 0.1 + 0.2
test2 = 1 + 2 × 3 answer 7, operator precedence in expressions

Calculation are as you type it on a calculator,
        1.00
+       2.00
×       3.00
════════════
        9.00 no operator precedence

test3 = 5^500 hover over test3, large values
test3 = 500 errors: variable already defined


calculations using finite precicion if result over range
test4 = 100 ÷ 300 
test5 = 100 ÷ 0 divide by zero


      100.00
÷       0.00 division by zero error
════════════
      100.00 skipping error calculations

a = 100 b = 200

a = 500
b = 300
           a
+          b
════════════
      300.00 = c
+       5.00% ⥱ 15.00 adding 5%, c = 315
+          c   adding c to itself
════════════
      615.00
×       5.00% ⥱ 0.05 multiplying 615.00 by 0.05
════════════
       30.75

-     100.00 negation
-    -200.00 subtracting negetive numbers
════════════
      100.00

test line text with operators + - × ÷ % ^ -100 100+200

exp = 100 + 200 ÷ (500 + 20 - 520) divide by zero error in evaluation
exp1 = 1+2×((2+3)÷(25+25-50))
exp2 = 100 (200+200) no operator before '(' is dot product

      100.00
÷       test divide by undefined variable
════════════
      100.00
`
,
    }

  storage.root.tapeById.set(helpTape.id, helpTape);
  storage.root.tapeByTimeStamp.set(helpTape.timeStamp, helpTape);
  storage.root.tapeById.set(testTape.id, testTape);
  storage.root.tapeByTimeStamp.set(testTape.timeStamp, testTape);
  storage.root.last = helpTape;
  storage.root.recent.push(helpTape);
  
}