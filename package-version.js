#!/usr/bin/env node

/**
 * Sets the version on both package.json files ahead of a publish.
 *
 * NON-INTERACTIVE WHEN TOLD WHICH VERSION TO USE, and that is the point: the
 * prompt below cannot be driven by CI, a script, or an agent — anything without
 * a TTY reads EOF and either aborts or silently takes the default, which
 * publishes the wrong version. Passing a flag skips the prompt entirely.
 *
 *   npm run package:publish -- --version=18.0.71   exact version
 *   npm run package:publish -- --patch             18.0.70 -> 18.0.71
 *   npm run package:publish -- --minor             18.0.70 -> 18.1.0
 *   npm run package:publish -- --major             18.0.70 -> 19.0.0
 *
 * With no flag it prompts exactly as it always did, so nothing changes for
 * anyone running it by hand.
 *
 * Flags arrive by two routes and both are honoured: `args` reads them off
 * argv (`node package-version.js --patch`), and `arg` reads the npm_config_*
 * environment variables npm sets for `npm run x -- --patch`. See helpers.js.
 */

var fs = require('fs');
var prompts = require('prompts');
const env = require('./libs/env');
const console = require('./libs/console');
const { args, arg } = require('./helpers');

const currentVersion = require(env.packageJsonPath()).version;

/**
 * Splits on the LAST three dot-separated numbers rather than assuming the whole
 * string is a bare semver — a version may carry a prefix or a suffix, and
 * bumping the wrong digit run is worse than refusing.
 */
function parseVersion(version) {
  const match = /^(.*?)(\d+)\.(\d+)\.(\d+)(.*)$/.exec(version);

  if (!match) {
    return null;
  }

  return {
    prefix: match[1],
    major: Number(match[2]),
    minor: Number(match[3]),
    patch: Number(match[4]),
    suffix: match[5],
  };
}

function bump(version, slot) {
  const parts = parseVersion(version);

  if (!parts) {
    return null;
  }

  const bumped = {
    major: { major: parts.major + 1, minor: 0, patch: 0 },
    minor: { major: parts.major, minor: parts.minor + 1, patch: 0 },
    patch: { major: parts.major, minor: parts.minor, patch: parts.patch + 1 },
  }[slot];

  return `${parts.prefix}${bumped.major}.${bumped.minor}.${bumped.patch}${parts.suffix}`;
}

/** A flag is set if it came through argv OR through npm_config_*. */
function flag(name) {
  return name in args || arg.exists(name);
}

/** The value of a flag from whichever route carried it. */
function flagValue(name) {
  return args[name] || arg.get(name);
}

/**
 * Resolves the version WITHOUT prompting, or returns null to fall through to
 * the prompt. An explicit --version wins over a slot flag: it is the more
 * specific instruction.
 */
function resolveFromFlags() {
  const explicit = flagValue('version');

  if (explicit && explicit !== 'true') {
    return explicit;
  }

  const slot = ['major', 'minor', 'patch'].find((name) => flag(name));

  return slot ? bump(currentVersion, slot) : null;
}

const nextPatchVersion = bump(currentVersion, 'patch');
const nextMinorVersion = bump(currentVersion, 'minor');
const nextMajorVersion = bump(currentVersion, 'major');

function write(version) {
  const packageJson = require(env.packageJsonPath());
  const packagePackageJson = require(env.packagePackageJsonPath());

  packagePackageJson.version = version;
  packageJson.version = version;

  fs.writeFileSync(env.packageJsonPath(), JSON.stringify(packageJson, null, 2).trim());
  fs.writeFileSync(env.packagePackageJsonPath(), JSON.stringify(packagePackageJson, null, 2).trim());

  console.success(`Version set to ${version}`);
}

(async () => {
  const flagged = resolveFromFlags();

  if (flagged) {
    // A malformed --version is a hard stop rather than a guess: publishing the
    // wrong version is not recoverable from npm.
    if (!parseVersion(flagged)) {
      console.error(`Invalid version "${flagged}". Expected a version like 18.0.71.`);
      process.exit(55);
    }

    write(flagged);

    return;
  }

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
        console.error('Version number not specified');
        process.exit(55);
      }

      write(version);
    });

})();
