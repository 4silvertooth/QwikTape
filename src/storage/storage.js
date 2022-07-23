import * as DB from "@storage"; 
import * as Env from "@env";
import * as Sciter from "@sciter";

const fileVersion = 2;
const locale = globalThis.locale || 1234567.89.toLocaleString();

let storage = DB.open(Env.path("documents") + "/qwiktapes.db", true);

function initDb(storage) {
  storage.root = {
    version: fileVersion,
    tapeById: storage.createIndex("string", true),
    tapeByTimeStamp: storage.createIndex("date", true),
    last: null,
    recent: [],
    settings: {
      'locale': locale,
      'decimalDigits': 2,
      'padding': 12,
      'replaceOperator': true,
      'colors': {
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

function seed(storage){
  const { intro, tests } = Sciter.import("./seeds.js");
  const helpTape = {
    id: Sciter.uuid(),
    name: "Introduction",
    timeStamp: new Date(),
    freeze: true,
    locale: locale,
    text: intro,
  }

  const testTape = {
    id: Sciter.uuid(),
    name: "Tests",
    timeStamp: new Date(helpTape.timeStamp.valueOf()+1000),
    freeze: false,
    locale: locale,
    text: tests,
  }

  storage.root.tapeById.set(helpTape.id, helpTape);
  storage.root.tapeByTimeStamp.set(helpTape.timeStamp, helpTape);
  storage.root.tapeById.set(testTape.id, testTape);
  storage.root.tapeByTimeStamp.set(testTape.timeStamp, testTape);
  storage.root.last = helpTape;
  storage.root.recent.push(helpTape);  
}

//this needs to change after the storage-sdk bug is fixed
function migrateDb(storage){
  if(!storage.root) return null;
  if(storage.root.version == 1){
    const backupById = storage.root.tapeById;
    const backupByTimeStamp = storage.root.tapeByTimeStamp;
    /*for(var tape in indexByTimeStamp){
      tape.locale = locale;
    }*/
    const migrate = JSON.parse(JSON.stringify(storage.root));
    migrate.tapeById = backupById;
    migrate.tapeByTimeStamp = backupByTimeStamp;
    migrate.version = 2;
    migrate.settings.decimalDigits = migrate.settings.precision;
    delete migrate.settings.precision;
    migrate.settings.locale = locale;
    storage.root = migrate;
    storage.commit();
  }

  return storage.root;
}

let root = migrateDb(storage) || initDb(storage);
console.log(root);
for(var tape of root.tapeByTimeStamp){
  console.log(tape);
}

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
  locale;
  
  constructor(text) {
    this.id = Sciter.uuid();
    this.name = printf("My Tape - %d", root.tapeById.length);
    this.timeStamp = new Date();
    this.text = text;
    this.locale = locale;

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
