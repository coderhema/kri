// kri-overlay.js — 120-line chat UI for Kri operator
// Injected into target site. No frameworks. No bundlers.

(function() {
  const KRI_CHAT_ID = 'kri-chat-widget';
  const KRI_CHAT_TOGGLE = 'kri-chat-toggle';
  
  // Only inject once
  if (document.getElementById(KRI_CHAT_ID)) return;
  
  // Create container
  const container = document.createElement('div');
  container.id = KRI_CHAT_ID;
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  container.style.width = '300px';
  container.style.maxHeight = '400px';
  container.style.backgroundColor = '#fff';
  container.style.borderRadius = '12px';
  container.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
  container.style.display = 'none';
  container.style.flexDirection = 'column';
  container.style.fontFamily = 'sans-serif';
  
  // Header
  const header = document.createElement('div');
  header.style.backgroundColor = '#007BFF';
  header.style.color = 'white';
  header.style.padding = '10px';
  header.style.borderRadius = '12px 12px 0 0';
  header.style.fontSize = '14px';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.innerHTML = '<strong>Kri Assistant</strong><span style="cursor:pointer;" id="kri-close">&times;</span>';
  container.appendChild(header);
  
  // Chat area
  const chatArea = document.createElement('div');
  chatArea.style.height = '200px';
  chatArea.style.overflowY = 'auto';
  chatArea.style.padding = '10px';
  chatArea.style.backgroundColor = '#f9f9f9';
  chatArea.style.borderBottom = '1px solid #eee';
  container.appendChild(chatArea);
  
  // Input area
  const inputArea = document.createElement('div');
  inputArea.style.display = 'flex';
  inputArea.style.padding = '10px';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Ask Kri to help...';
  input.style.flex = '1';
  input.style.padding = '8px';
  input.style.border = '1px solid #ddd';
  input.style.borderRadius = '6px';
  input.style.outline = 'none';
  
  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Send';
  sendBtn.style.backgroundColor = '#007BFF';
  sendBtn.style.color = 'white';
  sendBtn.style.border = 'none';
  sendBtn.style.padding = '8px 12px';
  sendBtn.style.borderRadius = '6px';
  sendBtn.style.marginLeft = '8px';
  sendBtn.style.cursor = 'pointer';
  
  inputArea.appendChild(input);
  inputArea.appendChild(sendBtn);
  container.appendChild(inputArea);
  
  // Toggle button
  const toggle = document.createElement('div');
  toggle.id = KRI_CHAT_TOGGLE;
  toggle.textContent = '🤖';
  toggle.style.position = 'fixed';
  toggle.style.bottom = '20px';
  toggle.style.right = '20px';
  toggle.style.width = '50px';
  toggle.style.height = '50px';
  toggle.style.backgroundColor = '#007BFF';
  toggle.style.color = 'white';
  toggle.style.borderRadius = '50%';
  toggle.style.display = 'flex';
  toggle.style.justifyContent = 'center';
  toggle.style.alignItems = 'center';
  toggle.style.fontSize = '20px';
  toggle.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  toggle.style.cursor = 'pointer';
  toggle.style.zIndex = '9999';
  
  document.body.appendChild(toggle);
  document.body.appendChild(container);
  
  // Toggle visibility
  toggle.addEventListener('click', () => {
    container.style.display = container.style.display === 'flex' ? 'none' : 'flex';
  });
  
  document.getElementById('kri-close').addEventListener('click', () => {
    container.style.display = 'none';
  });
  
  // Send message
  sendBtn.addEventListener('click', () => {
    const msg = input.value.trim();
    if (!msg) return;
    
    const msgEl = document.createElement('div');
    msgEl.style.backgroundColor = '#007BFF';
    msgEl.style.color = 'white';
    msgEl.style.padding = '8px 12px';
    msgEl.style.borderRadius = '12px';
    msgEl.style.maxWidth = '70%';
    msgEl.style.marginBottom = '8px';
    msgEl.style.marginLeft = 'auto';
    msgEl.textContent = msg;
    chatArea.appendChild(msgEl);
    
    input.value = '';
    
    // Send to backend
    fetch('http://localhost:3000/agent/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId: window.location.hostname, userInput: msg })
    })
    .then(r => r.json())
    .then(data => {
      const resEl = document.createElement('div');
      resEl.style.backgroundColor = '#f1f1f1';
      resEl.style.padding = '8px 12px';
      resEl.style.borderRadius = '12px';
      resEl.style.maxWidth = '70%';
      resEl.style.marginBottom = '8px';
      resEl.style.wordWrap = 'break-word';
      resEl.textContent = data.success ? '✅ Done!' : '❌ Failed: ' + data.error;
      chatArea.appendChild(resEl);
      chatArea.scrollTop = chatArea.scrollHeight;
    });
  });
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
  });
})();