#!/usr/bin/env node

/**
 * Commits, pushes and tags the repo after a successful npm publish.
 *
 * NON-INTERACTIVE WHEN GIVEN A MESSAGE, for the same reason as package-version:
 * the prompt below cannot be driven without a TTY, and a publish that succeeds
 * on npm but leaves the repo uncommitted and untagged is the worst of the two
 * halves to be missing.
 *
 *   npm run package:publish -- --version=18.0.71 --message="Add dark mode support"
 *
 * With no --message it prompts exactly as it always did.
 *
 * WHAT IT COMMITS: `git add .` stages EVERYTHING in the repo, including work
 * unrelated to the release. Commit or stash anything that does not belong in
 * the release before running this.
 */

var cmd = require('./libs/cmd');
var env = require('./libs/env');
var prompts = require('prompts');
var console = require('./libs/console');
const { args, arg } = require('./helpers');

/** The message from whichever route carried it, or null to prompt. */
function messageFromFlags() {
  const message = args.message || arg.get('message');

  return message && message !== 'true' ? message : null;
}

Promise.all([
  cmd.exec(`cd ${env.projectDir()} && git diff --name-only`),
  cmd.exec(`cd ${env.projectDir()} && git diff --name-only --staged`),
  cmd.exec(`cd ${env.projectDir()} && git ls-files --other --exclude-standard`),
])
  .then(async ([unstaged, staged, untracked]) => {
    if (unstaged || untracked) {
      if (unstaged) {
        await cmd.exec(`cd ${env.projectDir()} && git add .`);
      }

      const message = messageFromFlags() || await promptMessage();

      if (!message) {
        console.error('Commit message not specified');
        process.exit(55);
      }

      await cmd.exec(
        `cd ${env.projectDir()} && git commit --message="${message.replace(/"/g, '\\"')}"`,
      );

      // AWAITED, not fired alongside the tag. These used to run together, so a
      // slow push could still be in flight while the tag push started — and a
      // tag that reaches the remote before its commit is a broken ref.
      await push();
      await createTag();

      return;
    }

    if (staged) {
      await push();
    }

    await createTag();
  })
  .catch((error) => {
    console.error(`Failed to commit, push or tag: ${error}`);
    process.exit(56);
  });

function promptMessage() {
  return prompts([
    {
      type: 'text',
      name: 'message',
      message: 'There are files that have not been committed.\n\nPlease provide a commit message.',
    },
  ]).then((response) => response.message);
}

/**
 * Tags this release, REPLACING a tag of the same name locally and on origin.
 *
 * A re-run release (a publish that died after npm but before the tag, a
 * version that was tagged by hand on the wrong commit) used to fail here with
 * "tag already exists", leaving the old tag pointing at the old commit. The
 * tag now always lands on the commit this release was published from.
 */
async function createTag() {
  const tag = `v${env.packageJsonVersion()}`;
  const remote = await cmd.exec(`cd ${env.projectDir()} && git ls-remote --tags origin refs/tags/${tag}`);

  if (remote.trim()) {
    console.log(`${tag} already exists on origin; replacing it with this release`);
  }

  await cmd.exec(`cd ${env.projectDir()} && git tag --force ${tag}`);

  return cmd.exec(`cd ${env.projectDir()} && git push --force origin refs/tags/${tag}`);
}

function push() {
  return cmd.exec(`cd ${env.projectDir()} && git push origin master`);
}
