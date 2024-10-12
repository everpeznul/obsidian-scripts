let plugin = null;

function setPlugin(p) {
  plugin = p;
}

function getPlugin() {
  if (!plugin) {
    throw new Error("Plugin has not been initialized");
  }
  return plugin;
}

module.exports = {
  setPlugin,
  getPlugin,
};
