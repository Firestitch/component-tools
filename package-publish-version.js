#!/usr/bin/env node

var cmd = require('./libs/cmd');
var env = require('./libs/env');
var prompts = require('prompts');


const unstaged = cmd.exec(`cd ${env.projectDir()} && git diff --name-only`);
const staged = cmd.exec(`cd ${env.projectDir()} && git diff --name-only --staged`);
const untracked = cmd.exec(`cd ${env.projectDir()} && git ls-files --other --exclude-standard`);

Promise.all([
  unstaged, staged, untracked
])
  .then((result) => {
    if(result[0] || result[2]) {
      if(result[0]) {
        cmd.exec(`cd ${env.projectDir()} && git add .`);
      }

      prompts([
        {
          type: 'text',
          name: 'message',
          message: 'There are files that have not been committed.\n\nPlease provide a commit message.',
        },
      ])
        .then((response) => {
          cmd.exec(`cd ${env.projectDir()} && git commit --message="${response.message.replace('"','\\"')}"`)
            .then(() => {
              push();
              createTag();
            });
        });
    } else {
      new Promise(() => {
        return result[1] ? push() : Promise.resolve();
      })
      .then(() => {
        createTag();
      });
    }
  });

  function createTag() {
    const version = env.packageJsonVersion();
    return cmd.exec(`cd ${env.projectDir()} && git tag v${version} && git push origin v${version}`);
  }

  function push() {
    return cmd.exec(`cd ${env.projectDir()} && git push origin master`);
  }