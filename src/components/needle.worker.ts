//web worker for needle-rs to avoid blocking the main thread during initialization and calls
//receives wasm module from main thread, initializes needle, and listens for messages to call needle functions
import initNeedle, { NeedleWasm } from "needle-rs";

let needle: NeedleWasm | undefined;

async function init() {
   await initNeedle();

}

self.addEventListener("message", async (event) => {
  const { id, type, payload } = event.data;
  await init();


  try {
    let result;
    switch (type) {
        case "load-model":
            const {weights, vocab} = payload;
            try{
            needle = NeedleWasm.load(new Uint8Array(weights), vocab);
            } catch (error) {
                throw new Error(`Failed to load model: ${error instanceof Error ? error.message : String(error)}`);
            }
            
            result = {type:"ready"};
            break;
      case "query":
        const { query, tools } = payload;
        if (!needle) {
          throw new Error("Needle is not initialized");
        }
        try {
            const output = needle.run(query, tools);
            result = {type: "result", message: output};
        } catch (error) {
            throw new Error(`Failed to run query: ${error instanceof Error ? error.message : String(error)}`);
        }
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
  }
});