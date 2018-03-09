'use strict';

const yargs = require('yargs');

function parseArgs(args = null) {
  return checkAndParseArgs(
    buildYargs(args)
  );
}

/*
helpText="${CYAN}USAGE:${NC}
  $0 8.9.1 [-p 17772] [-c Carbon] [-b v8.x] [-d 2017-11-20] [-m] [-u upstream]

  8.9.0             $sep Node version to release
  -d 2017-11-20     $sep Date to use (default: today)
  -m                $sep This is a maintenance release
  -r /path/to/node/ $sep Use if this script isn't in node/tools/
  -b v8.x           $sep Branch name (default: v<Major>.x)
  -u upstream       $sep Name of upstream remote (default: upstream)
  -p 58972          $sep PR number (or full URL)
  -h                $sep Show help.
  */

function buildYargs(args = null) {
  if (args === null) { args = process.argv.slice(2); }
  return yargs(args)
    .usage(
      '$0 <Version> [options]',
      'Helper for the Node.js release process, generates a Markdown file with' +
      ' all the steps required to do a Node.js release. In future this will ' +
      'run some of these commands for you.'
    )
    .detectLocale(false)
    .demandCommand(
      1,
      'Version to release is required as the first argument')
    .option('codename', {
      alias: 'c',
      demandOption: false,
      describe: 'LTS codename (implies LTS)',
      type: 'string'
    })
    .option('date', {
      alias: 'd',
      demandOption: false,
      describe: 'Date to use (default: today)',
      type: 'string'
    })
    .option('repo', {
      alias: 'r',
      demandOption: false,
      describe: 'Path to node repo (default: cwd)',
      type: 'string'
    })
    .option('file', {
      alias: 'f',
      demandOption: false,
      describe: 'File to write the release notes to (default: ./release-<version>.md)',
      type: 'string'
    })
    .option('readme', {
      demandOption: false,
      describe: 'Path to file that contains collaborator contacts',
      type: 'string'
    })
    .option('check-comments', {
      demandOption: false,
      describe: 'Check for \'LGTM\' in comments',
      type: 'boolean'
    })
    .option('max-commits', {
      demandOption: false,
      describe: 'Number of commits to warn',
      type: 'number',
      default: 3
    })
    .example(`node $0 -v 6.11.1.0 \\
      -i ./node-sdk.json \\
      -t $GHE_TOKEN \\
      -r runtimes/squad-node-dragons \\
      -u JSBuild \\
      -e jsbuild@ca.ibm.com`,
      'Runs the script against the dragons repo, committing as JSBuild.')
    .help()
    .alias('help', 'h')
    .argv;
}

const PR_RE = new RegExp(
  '^https://github.com/(\\w+)/([a-zA-Z.-]+)/pull/' +
  '([0-9]+)(?:/(?:files)?)?$');

function checkAndParseArgs(args) {
  const {
    owner = 'nodejs', repo = 'node',
    identifier, file, checkComments, maxCommits, readme
  } = args;
  const result = {
    owner, repo, file, checkComments, maxCommits, readme
  };
  if (!isNaN(identifier)) {
    result.prid = +identifier;
  } else {
    const match = identifier.match(PR_RE);
    if (match === null) {
      throw new Error(`Could not understand PR id format: ${identifier}`);
    }
    Object.assign(result, {
      owner: `${match[1]}`,
      repo: `${match[2]}`,
      prid: +match[3]
    });
  }

  let sliceLength = Math.abs(maxCommits);
  if (isNaN(sliceLength)) { sliceLength = 3; }
  Object.assign(result, {
    maxCommits: sliceLength
  });

  return result;
}

module.exports = parseArgs;
