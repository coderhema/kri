import { initRetrofit } from './modes/retrofit.ts';
import { initScaffold } from './modes/scaffold.ts';
import { isEmptyDir } from './core/scanner.ts';

export async function runInit({ cwd }) {
  const empty = await isEmptyDir(cwd);
  if (empty) {
    await initScaffold({ cwd });
  } else {
    await initRetrofit({ cwd });
  }
}
