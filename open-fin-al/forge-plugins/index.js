const fs = require('fs-extra');
const path = require('path');
const PluginBase = require('@electron-forge/plugin-base').default;

function getCoreModuleName(depName) {
  const parts = depName.split('/');
  return parts[0];
}

async function copyDependencyNodeModules(packageJsonPath, sourceDir, targetDir) {
  try {
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
    const packageData = JSON.parse(packageJsonContent);
    const dependencies = packageData.dependencies || {}; 
    console.log(dependencies);

    if (Object.keys(dependencies).length === 0) {
      console.log(`No production dependencies found in ${packageJsonPath}`);
      return;
    }

    const packageDir = path.dirname(packageJsonPath);
    console.log(packageDir);

    if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
      console.warn(`Warning: node_modules folder not found in ${packageDir}`);
      return;
    }

    for (const depName of Object.keys(dependencies)) {
      // Skip built-in Node.js modules
      const coreDepName = getCoreModuleName(depName);
      console.log(coreDepName);
      /*try {
        if (require.resolve(coreDepName) === coreDepName) {
          console.log(`Skipping built-in module: ${coreDepName}`);
          continue;
        }
      } catch(resolveError) {
        console.log("The package name couldn't be resolved.");
      }*/
    
      const depSourcePath = path.join(sourceDir, coreDepName);
      const depSourceFullPath = path.join(sourceDir, depName); //to ensure that modules with an inner folder work. Ex. @xenova/transformers
      const depTargetPath = path.join(targetDir, 'node_modules', coreDepName);
      const depPackageJsonPath = path.join(depSourceFullPath, 'package.json');
      //console.log(`Source path: ${depSourcePath}`);
      //console.log(`Target path: ${depTargetPath}`);

      if (fs.existsSync(depSourcePath) && fs.statSync(depSourcePath).isDirectory()) {
        //console.log(`Trying to Copy dependency: ${coreDepName}`);
        try {  
          await fs.copy(depSourcePath, depTargetPath, { overwrite: false, errorOnExist: false });
        } catch (error) {
          console.error(`Error copying dependency ${coreDepName}:`, error);
          continue;
        }

        // Recurse into sub-dependencies
        if (fs.existsSync(depPackageJsonPath)) {
          await copyDependencyNodeModules(depPackageJsonPath, sourceDir, targetDir);
        }
      } else {
        console.warn(`Warning: Dependency folder not found: ${coreDepName}`);
      }
    }
  } catch (error) {
    console.error('Error copying dependencies:', error);
  }
}

class CopyDependenciesPlugin extends PluginBase {
    constructor(config = {}) {
      super();
      this.name = 'copy-dependencies';
      this.config = config;
    }

    getHooks() {
      return {
        prePackage: [this.prePackage],
      };
    }

    async init() {} 

    async prePackage(config, platform, arch) {
      console.log('\n--- Running custom copy-dependencies plugin ---');
  
      const rootPackageJsonPath = path.resolve(process.cwd(), 'package.json');
      const targetDir = path.join(process.cwd(), '.webpack', 'x64');
      const sourceDir = path.join(process.cwd(), 'node_modules');
      console.log(`The target directory is: ${targetDir}`);
      console.log(`The source directory is: ${sourceDir}`);

      const targetNodeModules = path.join(targetDir, 'node_modules');
      await fs.ensureDir(targetDir);
      await fs.ensureDir(targetNodeModules);
  
      await copyDependencyNodeModules(rootPackageJsonPath, sourceDir, targetDir);

      console.log(`✅ Production dependencies copied to: ${targetNodeModules}`);
    }
  }
  
  module.exports = CopyDependenciesPlugin;
