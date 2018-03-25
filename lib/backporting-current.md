# Backporting for the current release

# TODO(gib): Replace this with a script that does this.

Run branch-diff to generate a list of shas:

```bash
branch-diff --reverse --sha
```

For each commit try to cherry-pick it, if it fails:

Open PR in browser.

- Either fix conflicts and backport, or don't fix and bail.

If PR had multiple commits, `git cherry-pick --quit` and `git reset --hard` to
get rid of any previous commits from that PR.

If we bail add a comment to PR either requesting a backport or saying it's
`dont-land`.



# How to help with Node.js releases


Should document this in nodejs/Release
