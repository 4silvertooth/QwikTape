import * as sys from "@sys";

const INSTANCE = "qwiktape";

(async ()=>{
  const pipe = new sys.Pipe();
  document.on("beforeunload", evt => pipe.close());
  
  try {
    pipe.bind(INSTANCE);
    pipe.listen();
    let scan;
    while (true) {
      scan = await pipe.accept();
      while (scan) {
        try {
          data = await scan.read();
          if (!data) break;
          Window.this.activate();
        }
        catch (e) {
          break;
        }
      }
      scan = undefined;
    }
  } 
  catch (e) {
    pipe.close();
    await pipe.connect(INSTANCE);
    await pipe.write(INSTANCE); //because why not?
    Window.this.close();
  }
})();