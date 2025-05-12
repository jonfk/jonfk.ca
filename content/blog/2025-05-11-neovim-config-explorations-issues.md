---
title: Navigating Hidden Neovim Configs can be Tiring
date: 2025-05-11
tags: neovim mcp llm learning
---

I want a faster way to understand a Neovim setup than grepping through Lua or reading through multiple websites documentation.  
Right now I can *sort of* discover keymaps via a picker `:lua Snacks.picker.keymap()`, `:Telescope keymaps`, or the classic `:map`, `:imap`, etc., and I can read plugin help—but there’s no single place that surfaces **everything** (keymaps, commands, plugin tweaks) in one go.

> [!INFO] **What’s a “picker”?  
>**In Neovim land, a *picker* is an interactive fuzzy-finder window—typically powered by [**Telescope.nvim**](https://github.com/nvim-telescope/telescope.nvim) or Folke’s **Snacks** plugin—that lets you search lists (files, keymaps, commands) and act on a selected item.

## Where Current Tools Fall Short

| Tool | Strength | Pain Point |
|------|----------|------------|
| **Telescope / Snacks pickers** | Fast fuzzy search | Still bounce between multiple pickers for keymaps, commands, help, and settings. And you kind of need to know what you are looking for. |
| **`:map`, `:imap`, `:verbose map {lhs}`** | Raw lists of mappings | Zero context—hard to see *why* and *where* a mapping was set |
| **which-key.nvim** | Gorgeous pop-ups | Can’t enumerate **insert-mode** maps or show a fully-flattened view |
| **Plugin docs** | Detailed reference | Scattered across dozens of Markdown files; you must already know which plugin to look at. A lot to read through when you are looking for something in particular. |

Put together, that’s a lot of jumping around and context switching.

## Experiments So Far

This rabbit hole began when I decided it was time to **upgrade my own config** and figured I’d see what other distros were doing right. After a long stint on **kickstart.nvim**, I sampled LazyVim, LunarVim, NvChad, and friends.

* **Kickstart** – You read the entire config and own it. I still had blind spots (the `lspconfig` / Mason interactions), but I still felt like I knew my config and where to change something if I needed to.  
* **Full-featured distros** – A bunch of Lua wires everything up, but these distros don't usually expect the average user to read through them. You’re *meant* to override their configs to customize them, yet finding the right lever is a scavenger hunt. (I will admit that only LazyVim got a real trial. I only played around a bit with LunarVim)

Bottom line: distro exploration feels like spelunking without a headlamp.

> [!INFO] **Quick demo: find *where* a mapping is defined**  
> ```vim
> " Normal-mode maps that start with <leader>f
> :verbose nmap <leader>f
> " Output ends with something like:
> "     Last set from /path/to/plugin/file.lua line 42
> ```
> Use this when you’ve spotted a mapping but don’t know which plugin or file created it.

## Concrete Examples of “Exploration Fatigue”

```vim
" List all normal-mode keymaps via Telescope
:Telescope keymaps mode=n

" Get every mapping (across all modes) and dump to a scratch buffer
:lua vim.print(vim.tbl_map(function(m) return m.lhs end, vim.api.nvim_get_keymap('')))

" Show plugin profiles in LazyVim
:Lazy profile
```

Each of these helps, but none gives me the single dashboard I’m after.

## A Better Approach?: A Queryable Neovim

Imagine chatting with your editor:

“What keymaps are active right now?”
“Who defines gx, and where?”
“List all Telescope customisations.”

Simply dumping config files into an LLM hits token limits on big distros.
A more scalable path is to expose runtime APIs an LLM can call:
- list installed plugins
- fetch help for any command/topic
- enumerate active keymaps with their sources

With that, an MCP-style RPC server could feed structured answers to the model.
There’s already a promising skeleton: [bigcodegen/mcp-neovim-server](https://github.com/bigcodegen/mcp-neovim-server) aimed at editing assistance; its architecture looks adaptable for this my use-case. I might be able to modify it to do what I want.

> [!INFO] What’s MCP?
> Model-Control-Protocol: a lightweight JSON-RPC layer that lets an LLM plugin talk to Neovim over stdio or TCP, request data, and send actions back.

Have you hacked on something similar, or know plugins I’ve missed?
Drop me a note. I’d love to swap ideas and maybe prototype this together.
