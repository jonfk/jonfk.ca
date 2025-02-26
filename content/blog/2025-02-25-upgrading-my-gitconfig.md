---
title: A Git Configuration Overhaul
date: 2025-02-25
tags: git
---

I was drinking my morning coffee while browsing the usual tech updates when I stumbled across [an article](https://blog.gitbutler.com/how-git-core-devs-configure-git/) about how core Git developers configure their own `git config` settings. This immediately caught my attention, since I was curious to learn how the people who actually work on Git configure their own setups. It seemed like valuable insider knowledge.

## My Spartan Config Before

My Git configuration was pretty minimal before reading this article:

```ini
[user]
	name = Jonathan Fok kan
	email = jonathan@fokkan.ca
[core]
	editor = nvim
[alias]
	review = "!f(){ git fetch $1 pull/$2/head;git checkout FETCH_HEAD;}; f"
	shove = "!f(){ git push --force-with-lease $1 $2;}; f"
[includeIf "gitdir:~/work/"]
    path = .gitconfig.work
```

The only somewhat advanced thing I was using was the `includeIf` directive, which allows different configurations for personal versus work projects and different SSH keys for each context.

## What I Learned

The article detailed settings that even core Git developers change from the defaults. It turns out there are numerous quality-of-life improvements that could be made with just a few configuration tweaks.

One of the [linked articles](https://blog.gitbutler.com/git-autosquash/) about `git autosquash` was particularly intriguing. At a high level, autosquash allows you to create "fixup" commits that automatically get squashed into the right place during an interactive rebase. Instead of manually reordering commits during a rebase, you can mark a commit as a fixup for a previous commit, and Git will handle the placement automatically. This would make one of my common Git workflows much more efficient, though I'll need to experiment with it more before it fully clicks.

<details>
	<summary>A video showing how autosquash works</summary>
	<iframe width="560" height="315" src="https://www.youtube.com/embed/Md44rcw13k4?si=ZhNb3o0zH2Ix3oCv&amp;start=745" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</details>

From the Hacker News comments, I discovered Delta, a syntax-highlighting pager for Git. I've implemented it, and while I appreciate the syntax highlighting, I find the UI a bit busy. I'm curious to see how it displays three-way diffs with `zdiff3`, but I might need some time to get used to it compared to the plain diff view I'm accustomed to.

I also learned that adding `-p` to various Git commands like `log` and `add` will show the actual changes, which is super useful.

## My Expanded Config After

After reading the article and comments, I've significantly expanded my Git configuration:

```ini
[user]
	name = Jonathan Fok kan
	email = jonathan@fokkan.ca
[core]
	editor = nvim
[alias]
	review = "!f(){ git fetch $1 pull/$2/head;git checkout FETCH_HEAD;}; f"
	shove = "!f(){ git push --force-with-lease $1 $2;}; f"
	out = "log @{u}.."
[column]
        ui = auto
[branch]
        sort = -committerdate
[tag]
        sort = version:refname
[init]
        defaultBranch = main
[diff]
        algorithm = histogram
        colorMoved = plain
        mnemonicPrefix = true
        renames = true
[push]
        default = simple
        autoSetupRemote = true
        followTags = true
[fetch]
        prune = true
        pruneTags = true
        all = true
[help]
        autocorrect = prompt
[commit]
        verbose = true
[rerere]
        enabled = true
        autoupdate = true
[rebase]
        autoSquash = true
        autoStash = true
        updateRefs = true
[pull]
        rebase = true
[core]
	# a matter of taste (uncomment if you dare)
	# Useful for really large repos but adds the overhead of a process per repository
        # fsmonitor = true
        # untrackedCache = true
[core]
	pager = delta
[interactive]
	diffFilter = delta --color-only
[delta]
	navigate = true  # use n and N to move between diff sections
	dark = true      # or light = true, or omit for auto-detection
[merge]
	# (just 'diff3' if git version < 2.3)
	conflictstyle = zdiff3
```

Some highlights of what I've added:
- Better branch and tag sorting (`branch.sort`, `tag.sort`)
- Improved diff algorithm and visualization (`diff.algorithm`, `colorMoved`)
- Enhanced pushing and fetching (`push.autoSetupRemote`, `fetch.prune`)
- Rebase improvements (`rebase.autoSquash`, `rebase.autoStash`)
- Delta integration for prettier diffs
- `out` alias for listing all unpushed commits
	- Read it with the Terminator's voice

I'm particularly looking forward to seeing how the `zdiff3` conflict style helps with merge conflicts, as this was highly recommended by the core developers.

While I haven't enabled the filesystem monitoring options (`fsmonitor` and `untrackedCache`), I might consider them for larger repositories despite the overhead of running additional processes.

It's amazing how much I was able to improve my Git experience with just these configuration changes. Sometimes it pays to see how the experts configure their own tools!

Here is a link to my dotfiles repo if you are interested. There might have been more updates since. [Github](https://github.com/jonfk/dotfiles/blob/master/git/.gitconfig)

## Sources

- [How Core Git Developers Configure Git](https://blog.gitbutler.com/how-git-core-devs-configure-git/)
- [HN comments for "How Core Git Developers Configure Git"](https://news.ycombinator.com/item?id=43169435)
- [Fixing up Git with Autosquash](https://blog.gitbutler.com/git-autosquash/)
