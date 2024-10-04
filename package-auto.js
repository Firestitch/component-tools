const fs = require('fs');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
let packagePath, packageJsonPath, srcPath;
const env = require('./libs/env');
const { args } = require('./helpers');

if (fs.existsSync(env.packageDir())) {
  packagePath = env.packageDir();
} else {
  console.log(RED, 'Path for package folder does not exists', RESET);
}

if (fs.existsSync(env.packageJsonPath())) {
  packageJsonPath = env.packageJsonPath();
} else {
  console.log(RED, 'Path for package.json does not exists', RESET);
}

if (fs.existsSync(env.srcDir())) {
  srcPath = env.srcDir();
} else {
  console.log(RED, 'Path for src folder does not exists', RESET);
}

const packageFile = require(packageJsonPath);

function checkModuleExists(name, module) {
  let path = null;

  switch (module) {
    case 'esm2022': {
      path = `esm2022/${name}.mjs`;
    } break;

    case 'fesm2022': {
      path = `fesm2022/${name}.mjs`;
    } break;

    case 'typings': {
      path = 'public_api.d.ts';
    } break;
  }

  const fullPath = packagePath + '/' + path;

  if (fs.existsSync(fullPath)) {
    return path;
  } else {
    console.log(RED, 'File ' + fullPath + ' does not exists.', RESET);
    console.log(RED, 'Possibly you forgot to build package before publish?', RESET);
    throw Error(`AUTO-PACKAGE: Path ${ fullPath } does not exists!`)
  }
}

const packageFileName = packageFile.name.replace('@', '').replace('/', '-');

console.log(BLUE, 'Creating package.json for ' + packageFileName, RESET);
console.log(BLUE, 'Checking package directory', RESET);

const packagePublishFile = {
  name: packageFile.name,
  version: packageFile.version,
  repository: packageFile.repository,
  author: packageFile.author,
  keywords: packageFile.keywords,
  license: packageFile.license,
  bugs: packageFile.bugs,
  peerDependencies: packageFile.peerDependencies,
  dependencies: packageFile.dependencies,
  sideEffects: false,
  overrides: packageFile.overrides,
};

if (!args.includeModules) {
  packagePublishFile.fesm2022 = checkModuleExists(packageFileName, 'fesm2022');
  packagePublishFile.esm2022 = checkModuleExists(packageFileName, 'esm2022');
  packagePublishFile.typings  = checkModuleExists(packageFileName, 'typings');
}

console.log(BLUE, 'Writing package.json file', RESET);

fs.writeFile(
  srcPath + '/package.json',
  JSON.stringify(packagePublishFile, null, 2),
  function(err) {

    if (err) {
      console.log(RED, 'package.json Creation Error: ', err, RESET);
      throw Error('package.json Creation Error: ' + err)
    }

    console.log(GREEN, 'package.json was successfully created', RESET);
});
