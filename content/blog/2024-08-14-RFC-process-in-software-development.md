---
title: RFC Processes for Software Development
date: 2024-08-14
tags: software-development process
---

Documenting at a high level what you want to achieve before committing to the work is often a good idea. Especially for complex projects or ideas. This allows others to look over the proposed changes, poke holes at it or be made aware of changes that could affect them.

A few ways I have seen this done at different companies are Technical Designs (TDs), Architecture Decision Records (ADRs) and Request for Comments.

I have found that a great way to write these kind of documents is in a format not too dissimilar to IETF RFCs. Those often have the right level of detail and a structure that lends itself well to software ideas. Words such as must, shall, should, etc as defined in [RFC-2119](https://datatracker.ietf.org/doc/html/rfc2119) are also useful to communicate the right level of requirement.

For documenting decisions at a project level, such as a tool or individual service, ADRs can be useful where a change can affect the overall project or projects interacting with it. I found that ADRs often break down and don't work well when multiple teams and projects are in one Architecture Decision Log (ADL, a collection of ADRs). They work better in high context situations where ADRs can be short and teams have enough understanding of the project to not have too much background details in ADRs.

Depending on your company or situation, you might want to make these documents more or less formal and structured.

One good example of an RFC process used at a private company for which their documents are public is Oxide Computer with their RFD documents. [Requests for Discussion](https://rfd.shared.oxide.computer/).
