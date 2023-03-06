#!/usr/bin/env node

var fs = require('fs');
var prompts = require('prompts');
const { args } = require('./helpers');

class PackageVersion {

  version = null;
  packageJson = null;
  packgePackageJson = null;
  packageJsonFile = null;
  packgePackageJsonFile = null;

  constructor(packageJsonFile, packgePackageJsonFile) { 
    this.packageJsonFile = packageJsonFile;
    this.packgePackageJsonFile = packgePackageJsonFile;
    this.version = require(this.packageJsonFile).version;
    this.nextVersion = this.version.replace(/(\d+$)/, (value, part) => { 
      return Number(part) + 1 
    });
  }  

  async promptVersion() {
    return new Promise((resolve) => {
      const onSubmit = (prompt, version) => {
        const packageJson = require(this.packageJsonFile);
        packageJson.version = version;  
        
        const packagePackageJson = require(this.packgePackageJsonFile);
        packagePackageJson.version = version;  

        fs.writeFileSync(this.packageJsonFile, JSON.stringify(packageJson,null,2).trim());  
        fs.writeFileSync(this.packgePackageJsonFile, JSON.stringify(packagePackageJson,null,2).trim());  
        resolve(version);
      };

      prompts([
        {
          type: 'select',
          name: 'version',
          message: 'Select a version',
          choices: [
            { title: `Next version ${this.nextVersion}`, value: this.nextVersion },
            { title: 'Current version', value: this.version },
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
          initial: this.version,
        }
      ],
       { onSubmit });
    });
  }
}


(new PackageVersion(args.packageJson, args.packagePackageJson)).promptVersion();