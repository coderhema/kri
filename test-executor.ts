import { Executor } from './agent/executor.ts';
import { getBrowserManager } from './agent/browser.ts';

async function testExecutor() {
  console.log('=== Testing Executor with new actions ===\n');
  
  const browserManager = await getBrowserManager();
  const page = await browserManager.getPage('test', 'https://example.com');
  
  const executor = new Executor();
  await executor.init(page);
  
  // Test navigate
  console.log('1. Testing navigate...');
  const navResult = await executor.execute({ action: 'navigate', value: 'https://example.com' });
  console.log('   Result:', navResult);
  
  // Test wait_for_selector
  console.log('\n2. Testing wait_for_selector...');
  const waitResult = await executor.execute({ action: 'wait_for_selector', selector: 'h1', value: '5000' });
  console.log('   Result:', waitResult);
  
  // Test scroll
  console.log('\n3. Testing scroll...');
  const scrollResult = await executor.execute({ action: 'scroll', direction: 'down', amount: 200 });
  console.log('   Result:', scrollResult);
  
  // Test screenshot
  console.log('\n4. Testing screenshot...');
  const ssResult = await executor.execute({ action: 'screenshot', path: '/tmp/kri-test.png' });
  console.log('   Result:', ssResult);
  
  // Test evaluate
  console.log('\n5. Testing evaluate...');
  const evalResult = await executor.execute({ action: 'evaluate', value: 'document.title' });
  console.log('   Result:', evalResult);
  
  // Test hover
  console.log('\n6. Testing hover...');
  const hoverResult = await executor.execute({ action: 'hover', selector: 'h1' });
  console.log('   Result:', hoverResult);
  
  await executor.close();
  await browserManager.close();
  
  console.log('\n=== All executor tests completed ===');
}

testExecutor().catch(console.error);
