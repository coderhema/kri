module.exports = {
  target: "https://your-website.com",
  agent: "claude-3-haiku",
  tools: ["web-scraper", "form-filler", "click-selector", "navigation-tracker"],
  memory: true,
  uiOverlay: true,
  daemon: true,
};