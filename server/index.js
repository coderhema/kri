"use strict";

const express = require('express');
const path = require('path');
const { Operator } = require('../agent/operator');
const { Daemon } = require('../daemon/repair');
const { Memory } = require('../agent/memory');

const app = express();
const PORT = 3000;

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// In-memory store for client sites
const sites = new Map();

// Load saved sites from config
const loadSites = () => {
  // Simulate loading from config file or DB
  // For v1: hardcoded for demo
  sites.set('demo-shopify.com', {
    url: 'https://demo-shopify.com',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString()
  });
};

loadSites();

// Dashboard route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: List sites
app.get('/api/sites', (req, res) => {
  const siteList = Array.from(sites.entries()).map(([id, site]) => ({
    id,
    url: site.url,
    enabled: site.enabled,
    status: site.status
  }));
  res.json(siteList);
});

// API: Toggle site
app.post('/api/sites/:id/toggle', (req, res) => {
  const { id } = req.params;
  if (!sites.has(id)) return res.status(404).json({ error: 'Site not found' });
  
  sites.get(id).enabled = !sites.get(id).enabled;
  res.json({ success: true, enabled: sites.get(id).enabled });
});

// API: Execute task
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

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Kri Dashboard running at http://localhost:${PORT}`);
  console.log('💡 Tip: Add a site with `kri add https://yourclient.com`');
});
