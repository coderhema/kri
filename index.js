import { initRetrofit } from "./modes/retrofit.js";
import { initScaffold } from "./modes/scaffold.js";
import { isEmptyDir } from "./core/scanner.js";

export async function runInit({ cwd }) {
  const empty = await isEmptyDir(cwd);
  if (empty) {
    await initScaffold({ cwd });
  } else {
    await initRetrofit({ cwd });
  }
}
