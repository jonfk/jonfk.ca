---
title: Bye tmux, hello neovim. How I am trying neovim as my terminal multiplexer
date: 2025-04-27
tags: neovim tmux workflow development terminal
---

I've been using Tmux as my terminal multiplexer for a little bit and well I have been pretty satisfied with the setup 
that I have. I have a set of plugins that allow me to do some pretty things I've been wanting to try a Tmux free 
workflow to that end I have tweaked my NeoVim config to allow Neovim to become the main central point of my 
development workflow. Now that means that instead of my terminal being the central point that hosts all of the 
other programs and processes to do various things in my workflow, I'm trying to replace that with Neovim. Let's see 
how this goes. 

But before explaining how I'm going to do this with Neovim, let's take a short detour how I'm currently using Tmux 
as my terminal multiplexer.

# My Tmux config and workflow

You can find my full unedited tmux config at this link: [70e3965](https://github.com/jonfk/dotfiles/blob/82baa45823132a71b50a6a333e1bd750c4127f8b/tmux/.tmux.conf).

## Tmux Sessions

My main workflow revolves around creating sessions for each project I am working on. I can then switch between sessions
my this little fzf command. I find the experience much better than the default choose tree. You can fuzzy find the 
session you are looking for in a few keys real quick.

```
bind s display-popup -E "tmux list-sessions | sed -E 's/:.*$//' | grep -v \"^$(tmux display-message -p '#S')\$\" | fzf --reverse --preview 'tmux capture-pane -ep -t {}' --preview-window=right:60% | xargs tmux switch-client -t"
```


## Vi Copy Mode

For getting text in and out of a tmux buffer, I use the `vi` copy-mode. It allows me to use vi keybindings to navigate,
yank, paste, etc. 

```
# vi bindings for copy mode
setw -g mode-keys vi
bind -T copy-mode-vi v send -X begin-selection
bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel
bind -T copy-mode-vi MouseDragEnd1Pane send-keys -X copy-pipe-and-cancel
```

## Tmux windows in sessions and workflow

A little quality of life thing I have is to start tmux windows at 1 instead of at 0. That's because it keeps all the
window numbers close together even if you don't have a lot of windows. Not a super big thing, but helps a lot I find.

```
# Start windows and panes at 1, not 0
set -g base-index 1
setw -g pane-base-index 1
```

While we are here, let's talk about how I create windows for each session. Like many other vimmers, my first window
in a tmux session, is a Neovim window. The next window (2), is always a shell prompt. It is always free for interactive
use. This allows me to go back and forth between the shell and nvim. 

Then the next few other buffers are project dependent, but a few common ones are a file watcher that runs and rebuilds 
the project as files change, documentation, an ssh session, etc.

I am a 1 window, 1 screen kind of person. While I have experimented with splits and multiple screens in the past, I
found that there would always be 1 main window at which I would always staring at, and a bunch of other things on the
other screens that I would really rarely care about. And if I tried to make more effective use of the other screens, 
I would be moving my head around way too much and giving me neck strain. Overall, I found my comfort best with 1 screen
on which I concentrate on, and being able to switch between the various windows or tabs effectively and quickly. How I do
that quickly and effectively, is program and OS dependent. I might expand on that one day. For now you can take a quick
look at [my hammerspoon config](https://github.com/jonfk/dotfiles/blob/82baa45823132a71b50a6a333e1bd750c4127f8b/hammerspoon/.hammerspoon/init.lua)
if you want to know how I do that for things outside of tmux and nvim.

## Tmux plugins

Finally, here's the shortlist of plugins that I use. I try to keep it fairly short since I generally don't like to 
have to remember too many different things from various plugins. Let's go through them.

```
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'catppuccin/tmux#v2.1.1'
set -g @plugin 'tmux-plugins/tmux-yank'
set -g @plugin 'christoomey/vim-tmux-navigator'
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'
```

1. **TPM** is the [Tmux Plugin Manager](https://github.com/tmux-plugins/tpm).
  It's the easiest way to manage plugins. Although it is a bit annoying that I need to manually fetch and initialize
  it before it can do it's work. Maybe one day it could come default with a tmux install.
2. **tmux-sensible** is a small package with a bunch of default settings that are pretty sensible. I used to carry around
  a bunch of such settings and found that that package was pretty much what I wanted and cleaned up my config.
3. **catppuccin** is nice for the eyes.
4. **tmux-yank** allows to yank to the system clipboard which makes integrating with other applications much easier.
5. **vim-tmux-navigator** gives keybinds for switching between tmux panes and nvim panes easy. I honestly used it very little
because I rarely do splits in tmux.
6. **tmux-resurrect** and **tmux-continuum** for session persistence. Resurrect restarts sessions from the previous instance 
of tmux and continuum autosaves the sessions so I don't have to think about it.

# What am I going to do in Neovim?

So as I mentioned earlier, I basically plan on making NeoVim my terminal multiplexer. So instead of starting a 
terminal instance and then starting Tmux sessions inside of that terminal instance and in those Tmux sessions start 
the NeoVim instances and various other shell prompts. I will start a Neovim instance and from there start terminal 
buffers inside of Neovim. 

From my light amount of testing of this workflow, I found that NeoVim's terminal works pretty well for me and my zsh 
config. So I'm pretty happy with zsh in Neovim. 

As for how I will replicate sessions into Neovim, well [Neovim](https://neovim.io/doc/user/starting.html#_views-and-sessions)
has `:mksessions` which allows you to create sessions and I'll be using a few plugins to basically do the same thing as 
what I was doing with tmux-resurrect and tmux-continuum which is to restart sessions whenever the tmux instance was 
killed or in this case the Neovim instance gets killed and autosave the sessions as I am using them.

I am currently trying out the **auto-session** plugin. You can see the changes to my config here: [commit](https://github.com/jonfk/dotfiles/commit/7d6bea52b6088bef6b50dc2b7e7990eb513e4b37).

For terminal buffers, I can start them with `:terminal` and I can switch between the buffers as I did before with 
telescope. I can even rename the terminal buffers with `:file new-buffer-name` if I ever need longer running instances.

One thing that I would like to figure out would be to have tmux like persistence of the shell history when restarting
the sessions and the ability to restart the previously running processes in the terminal buffers if the session is 
killed. But for now these are minor concerns that I will tackle when the time comes.

Now, in closing, I would like to mention that what allows me to do this is the fact that I make a fairly lightweight 
use of Tmux, other than being able to yank things from the buffers, being able to save sessions and restart sessions 
automatically, and basically a nice little visual flair with catpucchin. And I think those can be fairly easily 
replicated inside of neovim. This may not be without issues for people who make much heavier use of split spans and 
various other power features of tmux but since that's not me I'm gonna give it a try.

