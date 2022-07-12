import * as sys from "@sys";

const INSTANCE = "qwiktape";

(async () => {
  const pipe = new sys.Pipe();
  document.on("beforeunload", evt => pipe.close());
  try {
    pipe.bind('qwiktape');
    pipe.listen();
    let scan;
    while (true) {
      scan = await pipe.accept();
      while (scan) {
        try {
          data = await scan.read();
          if (!data) break;
          Window.this.state = Window.WINDOW_SHOWN;
        }
        catch (e) {
          break;
        }
      }
      scan = undefined;
    }
  } 
  catch (e) {
    await pipe.connect(INSTANCE);
    await pipe.write(INSTANCE); //because why not?
    Window.this.close();
  }
})();