---
title: My Personal Self-Hosted Infrastructure Part 1
date: 2024-09-09
tags: self-hosting
---

## Introduction

Over the past decade, there's been a noticeable shift in how software is delivered and consumed. Many applications that were once standalone programs are now served over the web. This trend towards web-based services and software-as-a-service (SaaS) models has its merits, but it also opens up opportunities for individuals to take control of their digital lives through self-hosting. In this post, I'll explore the reasons for this shift, the benefits of self-hosting, and share my personal journey into building a self-hosted infrastructure.

## Why Web Services?

The move towards web-based services has several advantages:

Personal Benefits:
- Access to apps and data from anywhere
- Easier collaboration on shared projects
- Simple sharing of content like photo galleries or works-in-progress

Technical Benefits:
- Access to software through APIs
- Ability to schedule tasks remotely
- Offloading processing to potentially more powerful servers

While these benefits could theoretically be achieved through desktop applications or command-line interfaces, web services with HTTP JSON APIs provide one of the simplest ways to reap these advantages.

## The Case for Self-Hosting

Despite the convenience of services like Google Workspace or Dropbox, there are compelling reasons to consider self-hosting:

1. Data Control: You maintain ownership and control over your data.
2. Customization: You can modify and adapt services to your specific needs.
3. Privacy: Your data remains on your own infrastructure.
4. Learning Opportunity: Self-hosting provides hands-on experience with various technologies.

Self-hosting does come with its challenges, but starting small and focusing on useful, frequently-used services can help you build a sustainable personal infrastructure.

## How It Started: My Self-Hosting Journey

My venture into self-hosting began in November 2017 with the purchase of a Synology DS218+ NAS, equipped with an 8TB WD Red Pro drive. Initially intended for expanded storage and photo backups, I soon discovered its potential as a home server through Docker support.

The first services I installed were:
1. Plex: For media organization and playback
2. Transmission: A torrent client

These services, which I had previously run locally, now benefited from operating on a dedicated, always-on server.

I started by using the Docker UI provided by Synology, which was sufficient for managing these two services. For remote access, I utilized Synology's DDNS service.

As I expanded my setup, I learned valuable lessons about storage management and hardware selection:

1. Understanding RAID: When my original 8TB drive began to fill up, I realized I needed to choose between additional storage (RAID 0) or data redundancy (RAID 1). I opted for RAID 1 to protect my important photos and videos.
2. Scaling Up: To increase storage capacity, I eventually purchased a larger NAS, the Synology DS1019+ with 5 bays. This experience taught me the importance of anticipating future needs when selecting hardware.
3. Start Small, Think Big: If I could advise my past self, I'd recommend thoroughly evaluating needs before investing in hardware. The adage "buy once, cry once" applies well to NAS and server setups. For those unsure about their requirements, starting with a used mini PC can be an excellent way to test use cases before committing to more expensive hardware.

## Conclusion

Self-hosting offers a powerful way to take control of your digital life, but it requires careful planning and a willingness to learn. As my journey shows, starting small and gradually expanding can lead to a robust and personalized infrastructure that meets your specific needs.

## Technical Terms Glossary

- **RAID (Redundant Array of Independent Disks)**: A storage technology that combines multiple disk drive components into a logical unit for data redundancy and performance improvement. Common RAID levels include:
  - RAID 0: Stripes data across drives for improved performance but no redundancy.
  - RAID 1: Mirrors data on two drives for full redundancy.
- **DDNS (Dynamic DNS)**: A method of automatically updating a name server in the Domain Name System with the active DHCP address. This is particularly useful for accessing home servers with dynamic IP addresses.
- **NAS (Network Attached Storage)**: A file-level computer data storage server connected to a computer network providing data access to heterogeneous network clients.
- **Docker**: A platform for developing, shipping, and running applications in containers, which are lightweight, standalone, executable packages of software that include everything needed to run an application.

