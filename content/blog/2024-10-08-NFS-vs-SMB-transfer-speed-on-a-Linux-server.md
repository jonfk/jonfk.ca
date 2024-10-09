---
title: NFS vs SMB transfer speed on a Linux server
date: 2024-10-08
tags: self-hosting
---

I also posted the full data in a git repo at https://github.com/jonfk/nfs-smb-benchmarking-experiment.

# NFS vs SMB transfer speed on a Linux server

I have been setting up my homelab server, migrating it from baremetal to Proxmox, a virtualization solution. The 
whole process is probably a blog post for another time. But while doing the migration, I got bitten by the improvement
bug, where I started wanting to improve various features I had decided on a good enough solution at the time. There
are probably several blog posts worth of things to discuss just on what I did, but let's not get side tracked.

One of the things was using SMB vs NFS on Linux. I have a Synology (ahem, actually two) NAS which I use for storing
large amounts of data that are not actively used on the system that generates it or the data might need to be shared
through the filesystem with multiple devices. Some examples are backups, photos, videos, entertainment media, etc. In
this particular case, it was a backup share from my Synology DS218+ to this new VM I was setting up.

So in the past, I had tried to use an NFS mount from my Linux server to the NAS but kept hitting issues with permissions
and user mappings that I didn't care to resolve at the time. The setup for SMB was simple enough that I decided to
just go with it at the time. But the original reason I wanted to try NFS was that it is supposed to be more resource
efficient and theoretically faster than SMB. So I finally decided to barrel through all the issues and got it working.
Now with 2 working mounting solutions, I wanted to see if I could benchmark the difference.

So here is what I found out. But first, how I ran the tests and some info about the servers.

# Setup

## Server

A Synology DS218+ NAS with the following specs:

|   |   |
|---|---|
|**CPU Model**|Intel Celeron J3355|
|**CPU Architecture**|64-bit|
|**CPU Frequency**|Dual Core 2.0 burst up to 2.5 GHz|
|**Hardware Transcoding Engine**|H.264 (AVC), H.265 (HEVC), MPEG-2 and VC-1; maximum resolution: 4K (4096 x 2160); maximum frame rate per second (FPS): 30|
|**System Memory**|10 GB DDR3L|
|**Total Effective Storage**|15.7TB|
|**Drives**|2 x Seagate IronWolf Pro ST18000NT001 18TB 7200 RPM|
|**Network Interface**|1GbE|

### NFS Config

|   |   |
|---|---|
|**Maximum NFS Protocol**|NFSv4.1|
|**Read Packet Size**|8KB|
|**Write Packet Size**|8KB|

### SMB Config

|   |   |
|---|---|
|**Maximum SMB protocol**|SMB3|
|**Minimum SMB protocol**|SMB1|
|**SMB range**|SMB1,5MB2,SMB2 and Large MTU,SMB3|
|**Transport encryption mode**|Client defined|
|**Enable server signing:**|Disable|
|**Enable Opportunistic Locking**|Enabled|
|**Enable SMB2 lease**|Disabled|
|**Enable SMB durable handles (Cross-protocol file locking will be disabled)**|Disabled|

|   |   |
|---|---|
|**Enable Local Master Browser**|Disabled|
|**Enable DirSort VFS module**|Disabled|
|**Veto files**|Disabled|
|**Allow symbolic links within shared folders**|Enabled|
|**Allow symbolic links across shared folders**|Disabled|
|**Disable multiple connections from the same IP address|Disabled|
|**Collect debug logs**|Disabled|
|**Apply default UNIX permissions**|Enabled|
|**Do not reserve disk space when creating files**|Disabled|

## Client

A little confusing since in this case the Linux server is acting as a client to the NAS.

| | |
|---|---|
|**CPU Model**|AMD Ryzen™ 7 3750H|
|**CPU Architecture**|64-bit|
|**CPU Frequency**|4 Cores/8 Threads (4MB Cache , up to 4.0 GHz)|
|**System Memory**|16 GB DDR4|
|**Network Interface**|2.5GbE|

### Mount Configs

The section of my cloud-init config that defines the NFS and SMB mounts.

```yaml
#cloud-config

mounts:
  - [ "192.168.50.55:/volume1/backups", "/mnt/nfs/ds218/backups", "nfs4", "rw,noatime,nodiratime,vers=4.1,soft,retrans=2,_netdev,async,rsize=32768,wsize=32768,fsc,cto,acl", "0", "0" ]
  - [ "//192.168.50.55/backups", "/mnt/smb/ds218/backups", "cifs", "username=notmyusername,password=notmypassword,vers=3.1.1,uid=1000,_netdev", "0", "0" ]
```

## Network

The NAS and server are connected wired through a 2.5GbE switch.

# Methodology

For more details on the exact script see [fs_bench.sh](./fs_bench.sh).

To test the filesystems speed, I ran the fs_bench.sh script which runs fio with the 5 test types on both mounts:

- Sequential read
- Sequential write
- Random read
- Random write
- Mixed random read/write

# Results

For the raw results see [fio_output.txt](./fio_output.txt). Otherwise here a summary created using the 
[analysis.py](./analysis.py) script follows in the next section.

## Performance Comparison: nfs vs smb

```
❯ python3 analysis.py
Performance Comparison: NFS vs SMB
==================================

SEQUENTIAL_READ:
  IOPS:        NFS: 110.00    SMB: 112.00    Difference: 1.82%
  Bandwidth:   NFS: 111.00 MiB/s    SMB: 112.00 MiB/s    Difference: 0.90%
  Avg Latency: NFS: 36091.93 µs    SMB: 35625.10 µs    Difference: 1.31%
  P99 Latency: NFS: 42206.00 µs    SMB: 35914.00 µs    Difference: 17.52%
  CPU Usage:
    User:      NFS: 0.03%    SMB: 0.04%    Difference: 0.01%
    System:    NFS: 0.73%    SMB: 0.46%    Difference: -0.27%
    Total:     NFS: 0.76%    SMB: 0.50%    Difference: -0.26%

SEQUENTIAL_WRITE:
  IOPS:        NFS: 107.00    SMB: 110.00    Difference: 2.80%
  Bandwidth:   NFS: 108.00 MiB/s    SMB: 110.00 MiB/s    Difference: 1.85%
  Avg Latency: NFS: 37040.95 µs    SMB: 36137.06 µs    Difference: 2.50%
  P99 Latency: NFS: 57410.00 µs    SMB: 60556.00 µs    Difference: -5.20%
  CPU Usage:
    User:      NFS: 0.11%    SMB: 0.13%    Difference: 0.02%
    System:    NFS: 0.65%    SMB: 1.23%    Difference: 0.58%
    Total:     NFS: 0.76%    SMB: 1.36%    Difference: 0.60%

RANDOM_READ:
  IOPS:        NFS: 7334.00    SMB: 5513.00    Difference: -24.83%
  Bandwidth:   NFS: 28.70 MiB/s    SMB: 21.50 MiB/s    Difference: -25.09%
  Avg Latency: NFS: 541.17 µs    SMB: 721.68 µs    Difference: -25.01%
  P99 Latency: NFS: 1319.00 µs    SMB: 1352.00 µs    Difference: -2.44%
  CPU Usage:
    User:      NFS: 0.80%    SMB: 1.05%    Difference: 0.25%
    System:    NFS: 2.96%    SMB: 2.56%    Difference: -0.40%
    Total:     NFS: 3.76%    SMB: 3.61%    Difference: -0.15%

RANDOM_WRITE:
  IOPS:        NFS: 6618.00    SMB: 7691.00    Difference: 16.21%
  Bandwidth:   NFS: 25.90 MiB/s    SMB: 30.00 MiB/s    Difference: 15.83%
  Avg Latency: NFS: 599.69 µs    SMB: 514.93 µs    Difference: 16.46%
  P99 Latency: NFS: 1532.00 µs    SMB: 2008.00 µs    Difference: -23.71%
  CPU Usage:
    User:      NFS: 0.75%    SMB: 1.33%    Difference: 0.58%
    System:    NFS: 2.94%    SMB: 10.33%    Difference: 7.39%
    Total:     NFS: 3.69%    SMB: 11.66%    Difference: 7.97%

MIXED_RANDRW:
  IOPS:        NFS: 3531.00    SMB: 3137.00    Difference: -11.16%
  Bandwidth:   NFS: 13.80 MiB/s    SMB: 12.30 MiB/s    Difference: -10.87%
  Avg Latency: NFS: 588.18 µs    SMB: 598.77 µs    Difference: -1.77%
  P99 Latency: NFS: 1516.00 µs    SMB: 2376.00 µs    Difference: -36.20%
  CPU Usage:
    User:      NFS: 0.79%    SMB: 1.17%    Difference: 0.38%
    System:    NFS: 3.16%    SMB: 5.37%    Difference: 2.21%
    Total:     NFS: 3.95%    SMB: 6.54%    Difference: 2.59%

Summary:
  sequential_read:
    Performance: SMB is faster by 1.82%
    CPU Efficiency: SMB uses less CPU by 0.26%
  sequential_write:
    Performance: SMB is faster by 2.80%
    CPU Efficiency: NFS uses less CPU by 0.60%
  random_read:
    Performance: NFS is faster by 33.03%
    CPU Efficiency: SMB uses less CPU by 0.15%
  random_write:
    Performance: SMB is faster by 16.21%
    CPU Efficiency: NFS uses less CPU by 7.97%
  mixed_randrw:
    Performance: NFS is faster by 12.56%
    CPU Efficiency: NFS uses less CPU by 2.59%
```

# Conclusion

The difference ended up being somewhat negligible for sequential reads and writes. With both NFS and SMB getting pretty
close to the theoretical limit of 125MB/s of the 1GbE link.

The difference in random read was fairly large of about 30% in favor of NFS. While the random write speed was in favor
of SMB with it being about 15% faster. And in a mixed workload of random reads and writes, NFS wins with the lightest
of margins of about 12%. In these, it does seem like NFS is slightly more CPU efficient but not really by much.

Was all this worth it? Not really but at least now I know that id doesn't make much of a difference at least with my
current setup. I have been planning on upgrading the NAS and network to 2.5GbE, I wonder if that would make a difference.
At least now that I had an easy quick setup to test this, I can do it again once I upgrade.
