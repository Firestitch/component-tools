const fs = require('fs');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
let packagePath, packageJsonPath, srcPath;

const args = process.argv.slice(2).reduce((acc, arg) => {

  if (arg.indexOf('--') === 0) {
    arg = arg.slice(2);
  }

  let [flag, value] = arg.indexOf('=') > -1 ? arg.split('=') : arg;
  acc[flag] = value;

  return acc;
}, {});

if (fs.existsSync(args.packageDir)) {
  packagePath = args.packageDir;
} else {
  console.log(RED, 'Path for package folder does not exists', RESET);
}

if (fs.existsSync(args.packageJson)) {
  packageJsonPath = args.packageJson;
} else {
  console.log(RED, 'Path for package.json does not exists', RESET);
}

if (fs.existsSync(args.src)) {
  srcPath = args.src;
} else {
  console.log(RED, 'Path for src folder does not exists', RESET);
}

const packageFile = require(packageJsonPath);

function checkModuleExists(name, module) {
  let path = null;

  switch (module) {
    case 'main': {
      path = `bundles/${name}.umd.js`;
    } break;

    case 'module': {
      path = `fesm5/${name}.js`;
    } break;

    case 'es2015': {
      path = `fesm2015/${name}.js`;
    } break;

    case 'esm5': {
      path = `esm5/${name}.js`;
    } break;


    case 'esm2015': {
      path = `esm2015/${name}.js`;
    } break;


    case 'fesm5': {
      path = `fesm5/${name}.js`;
    } break;

    case 'fesm2015': {
      path = `fesm2015/${name}.js`;
    } break;

    case 'typings': {
      path = `${name}.d.ts`;
    } break;

    case 'metadata': {
      path = `${name}.metadata.json`;
    } break;
  }

  path = packagePath + '/' + path;

  if (fs.existsSync(path)) {
    return path;
  } else {
    console.log(RED, 'File ' + path + ' does not exists.', RESET);
    console.log(RED, 'Possibly you forgot to build package before publish?', RESET);
    throw Error(`AUTO-PACKAGE: Path ${ path } does not exists!`)
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
  main:     checkModuleExists(packageFileName, 'main'),
  module:   checkModuleExists(packageFileName, 'module'),
  es2015:   checkModuleExists(packageFileName, 'es2015'),
  esm5:     checkModuleExists(packageFileName, 'esm5'),
  esm2015:  checkModuleExists(packageFileName, 'esm2015'),
  fesm5:    checkModuleExists(packageFileName, 'fesm5'),
  fesm2015: checkModuleExists(packageFileName, 'fesm2015'),
  typings:  checkModuleExists(packageFileName, 'typings'),
  metadata: checkModuleExists(packageFileName, 'metadata'),
  sideEffects: false,
};

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



