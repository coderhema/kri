document.addEventListener('DOMContentLoaded', () => {
  const siteList = document.getElementById('site-list');

  async function loadSites() {
    try {
      const res = await fetch('/api/sites');
      const sites = await res.json();
      
      if (sites.length === 0) {
        siteList.innerHTML = '<p>No sites added yet. Use `kri add <url>` in terminal.</p>';
        return;
      }
      
      siteList.innerHTML = '';
      
      sites.forEach(site => {
        const item = document.createElement('div');
        item.className = 'site-item';
        
        const statusClass = site.status === 'healthy' ? 'healthy' : 'broken';
        
        item.innerHTML = `
          <span>${site.id}</span>
          <span class="status ${statusClass}">${site.status}</span>
          <button class="toggle-btn ${site.enabled ? '' : 'off'}" data-id="${site.id}">
            ${site.enabled ? 'Disable' : 'Enable'}
          </button>
        `;
        
        siteList.appendChild(item);
      });
      
      // Add event listeners to toggle buttons
      document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const isOn = btn.classList.contains('off');
          
          const res = await fetch(`/api/sites/${id}/toggle`, {
            method: 'POST'
          });
          const data = await res.json();
          
          btn.textContent = data.enabled ? 'Disable' : 'Enable';
          btn.classList.toggle('off');
        });
      });
    } catch (err) {
      siteList.innerHTML = '<p>Error loading sites.</p>';
    }
  }
  
  loadSites();
  
  // Refresh every 5 seconds
  setInterval(loadSites, 5000);
});