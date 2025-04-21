const path = require('path');

// Import the plugin constructor
const CopyDependenciesPlugin = require('./forge-plugins'); // 👈 or just './forge-plugins'

// Simulate Forge's plugin system
async function testPlugin() {
    const pluginInstance = new CopyDependenciesPlugin({});

  // Simulate Forge calling the lifecycle hooks
  if (pluginInstance.init) {
    await pluginInstance.init();
  }

  const mockDir = path.resolve(__dirname, 'out-test'); // or whatever you want as the output dir

  if (pluginInstance.packageAfterCopy) {
    await pluginInstance.packageAfterCopy({ dir: mockDir });
  }

  console.log('✅ Plugin test complete.');
}

testPlugin().catch(err => {
  console.error('❌ Plugin test failed:', err);
});