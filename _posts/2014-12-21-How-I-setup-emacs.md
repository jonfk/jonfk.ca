---
layout: post
title: How I setup my emacs config
tags: emacs configurations productivity editors
---

First some background. I used vim for about 2 years. It was my first real editor back when I was a
first year CompSci student. It was a hard road in the beginning, learning modal editing, the
quirks of vim's configuration and various useful plugins using [Tim Pope's pathogen](https://github.com/tpope/vim-pathogen).

After a few years of vim usage, you could wonder why I switched, especially since I go out of
my way to set up emacs to replicate how I was using vim. Extensibility is the main reason. In
emacs, the ease of extending the capabilities of your editor to suit your needs makes my switch
worthwhile. I haven't given a real try to elisp yet (that's on my todo list) but binding a function
to a keymap is much easier to do and extending the functionality of your editor through it's API.

One of the well known sayings about emacs is : "a great operating system, lacking only a decent editor".
So although the default editor that comes with emacs is not great, you can make it <i>your</i> best editor.
The following packages are what makes emacs a better editor for me.

##EVIL
The most important piece of my emacs config is evil-mode. Evil brings modal editing to emacs and
replicates many of vim's features. All the keybindings I was used to in vim are there. I don't claim
to be the most advanced vim user out there. There are many that use vim's advanced features in
such a way that would prevent them to switch, but if your main reason to stay with vim is modal
editing, I urge you to give evil a try.

##package.el
Another reason why I prefer emacs is that since emacs24, package.el comes on the default installation.
This means that I can bootstrap my emacs from it's config file and have my customized environment in
a matter of seconds.

##Evil Leader
Although not as essential as it's namesake mode, evil-leader is useful to prevent rsi and map many
of emacs obscure keybindings to a simple 2 keypress. For example I map my leader to the `,` key and
`kill-buffer` is mapped to k, so to kill the current buffer I do `,-k`

My config is linked here: [.emacs]()