import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Operator } from '../agent/operator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const sites = new Map();

const loadSites = () => {
  sites.set('demo-shopify.com', {
    url: 'https://demo-shopify.com',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString()
  });
};

loadSites();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/sites', (req, res) => {
  const siteList = Array.from(sites.entries()).map(([id, site]) => ({
    id,
    url: site.url,
    enabled: site.enabled,
    status: site.status
  }));
  res.json(siteList);
});

app.post('/api/sites/:id/toggle', (req, res) => {
  const { id } = req.params;
  if (!sites.has(id)) return res.status(404).json({ error: 'Site not found' });

  sites.get(id).enabled = !sites.get(id).enabled;
  res.json({ success: true, enabled: sites.get(id).enabled });
});

app.post('/api/agent/execute', async (req, res) => {
  const { siteId, userInput } = req.body;

  if (!sites.has(siteId) || !sites.get(siteId).enabled) {
    return res.status(400).json({ success: false, error: 'Site not enabled or not found' });
  }

  const site = sites.get(siteId);
  const operator = new Operator(siteId, {
    agent: 'claude-3-haiku',
    daemon: true
  });

  try {
    await operator.init();
    const result = await operator.executeTask(userInput);
    await operator.close();
    res.json(result);
  } catch (err) {
    await operator.close();
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Kri Dashboard running at http://localhost:${PORT}`);
  console.log('💡 Tip: Add a site with `kri add https://yourclient.com`');
});
