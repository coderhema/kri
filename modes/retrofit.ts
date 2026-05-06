import { scanCodebase, readFiles } from '../core/scanner.ts';
import { renderSoul, writeSoulFile } from '../core/soul-writer.ts';

export async function initRetrofit({ cwd }) {
  const files = await scanCodebase(cwd);
  const contents = await readFiles(files.slice(0, 100)); // limit for v0
  const soul = renderSoul({
    systemName: 'Unknown System',
    whatIAm: 'I am a system discovered from an existing codebase.',
    purpose: 'Understand and serve my users based on the code I contain.',
    canDo: `I can interact with ${files.length} files.`,
    whoIServe: 'Developers and end users of this codebase.',
    mustNeverDo: 'Cause harm or violate developer constraints.',
    platform: 'Unknown (detected from codebase)',
    personality: 'Clear, deliberate, and aligned with developer intent.'
  });
  await writeSoulFile(cwd, soul);
  console.log('kri: soul.md generated (retrofit)');
}
