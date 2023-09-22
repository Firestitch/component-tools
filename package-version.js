#!/usr/bin/env node

var fs = require('fs');
var prompts = require('prompts');
const env = require('./libs/env');

const currentVersion = require(env.packageJsonPath()).version;

console.log(currentVersion);
const nextPatchVersion = currentVersion.replace(/(\d+)$/, (value, part) => { 
  return Number(part) + 1 
});
const nextMinorVersion = currentVersion.replace(/(\d+)\.(\d+)\.(\d+)$/, (value, major, minor) => { 
  return `${major}.${Number(minor) + 1}.0`;
});
const nextMajorVersion = currentVersion.replace(/(\d+)\.(\d+)\.(\d+)$/, (value, major) => { 
  return `${Number(major) + 1}.0.0`;
});

(async () => {
  const promptVersion = () => {
    return prompts([
      {
        type: 'select',
        name: 'version',
        message: 'Select a version',
        choices: [
          { title: `Next patch version ${nextPatchVersion}`, value: nextPatchVersion },
          { title: `Next minor version ${nextMinorVersion}`, value: nextMinorVersion },
          { title: `Next major version ${nextMajorVersion}`, value: nextMajorVersion },
          { title: `Current version ${currentVersion}`, value: currentVersion },
          { title: 'Custom version', value: 'custom' }
        ],
        initial: 0
      },
      {
        type: (value) => {
          return value === 'custom' ? 'text' : null;
        },
        name: 'version',
        message: 'Please enter the version number?',
        initial: currentVersion,
      }
    ]);
  };

  promptVersion()
    .then((response) => {
      const version = response.version;
    
      if(!version) {
        process.console.error('Version number not specified');
        process.exit(55);
      }
      
      const packageJson = require(env.packageJsonPath());
      const packagePackageJson = require(env.packagePackageJsonPath());
      packagePackageJson.version = version;  
      packageJson.version = version;  
    
      fs.writeFileSync(env.packageJsonPath(), JSON.stringify(packageJson,null,2).trim());  
      fs.writeFileSync(env.packagePackageJsonPath(), JSON.stringify(packagePackageJson,null,2).trim());  
    });

})();
