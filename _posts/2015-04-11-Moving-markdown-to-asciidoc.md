---
layout: post
title: Moving from markdown to asciidoc
tags: learning markup documentation writing
---

Markdown is probably the most popular markup language in the tech community. Often used in
comment sections, blogs (such as jekyll), readmes on github or even documentation. Its popularity can
easily be explained by its simplicity and extensibility, but this simplicity also explains why there
are so many flavours of markdown. If you are interested in markdown, it is worthwhile to check out
[CommonMark](http://commonmark.org/) which is a positive step in trying to standardize markdown and
specify many of its extensions.

I have been using markdown for a few years and unless I am writing a long form document for which
the formatting needs to be richer, I am often writing in markdown. It is very readable and the fact that
github renders markdown are the main reasons for why I use it, but I have been noticing some problems
when it comes to writing slightly longer documents with structure. Breaking out LaTex would not be very
productive, so I found a solution: [asciidoc](http://en.wikipedia.org/wiki/AsciiDoc).

Asciidoc is also a readable document format which has equivalents for any of markdowns constructs and more.
Things such as table of contents, continuous blocks can be grouped in elements, etc. It feels just as simple
as markdown with much more power for richer formatting if needed. I have already converted some of my
documents over to asciidoc and the process has gone swimmingly well.

Here is a simple readme in asciidoc:
```asciidoc
= Readme
Author Name <name@email.com>

== Heading 1

[source,haskell]
file.hs
----
collatz 1 = [1]
collatz n
        | even n = n:chain (n `div` 2)
        | odd n = n:chain (3*n + 1)
----

=== list of stuff:
* Lorem ipsum dolor sit amet, consectetur
* Donec lorem purus, vulputate et elementum tempus
* Ut blandit sagittis arcu, sit amet
```

Some quick references while writing your asciidoc documents:
- [Asciidoc quick reference](http://asciidoctor.org/docs/asciidoc-syntax-quick-reference/)
- [http://asciidoctor.org/docs/user-manual](Asciidoctor User Manual)
