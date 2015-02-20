---
layout: post
title: Some notes on bash scripting
tags: learning script scripting bash shell language
---

In your day to day tasks you often encounter tasks that are easily automated. Instead
of wasting time doing menial or mechanical tasks, you could be applying you brain power
to automating them. If you are a developer, this is doubly relevant to you to manage your
processes, build, cleaning your directory, etc.

Tasks such as massaging data from one format to another or quickly searching and replacing
words in certain files, can easily be dealt with a scripting language. One scripting language
that is widely available on most modern linux and unix systems is bash. Many people will argue
to write in sh which is described in the POSIX standard, but we won't be going into this debate
here. Instead I can state that most of these tips will be relevant for both.

##Why not Python, Perl or Ruby?
Although I believe these more fully featured language are appropriate for many tasks even beyond
simple scripts, I think it is still a useful skill to learn to script with your shell.

I have been doing some devops works recently and had to use a lot of shell scripting to glue together
the continuous integration pipeline. I don't claim to be a bash expert but here are some tips I picked up.

##Always use set -e
When running most scripts that are not simple on off jobs, you may want to be notified of an error
occuring and stop the execution of the script. By using "set -e" at the top of your script, it
will prevent the execution of the rest of your job if something fails. This allows you to be
explicit when you can allow some command to fail which is rarer than when you expect all the
commands to run.
```bash
set -e
```

##Use set -x for better debugging and logs
When running a script whose output will be captured such as in a ci pipeline, it is useful
to know what command was running last when something occurred, such as when an exception
occurred. Pretty useful for logs for this same reason.
```bash
set -x
```

##Use getopts for easy commandline options
Instead of parsing the commandline parameters manually you can simply use the getopts
library to do the job. It supports only short commandline options to make things simpler.
```bash
#!/usr/bin/env bash

while getopts "h:s" OPTION; do
  case $OPTION in
    h)
      echo "usage"
      ;;
    f)
      FILE=$OPTARG
      echo $FILE
      ;;
  esac
done
```
A column ':' before a character tells getopts which character needs a value.
A column ':' at the beginning of the optstring (e.g. ":h:s") sets OPTION var
with “?” and the $OPTARG with the wrong character and no output to stderr.
Otherwise it would print an illegal argument message to stderr.

##Print a multiline string
Instead of printing with several echos for each line use here documents.
```bash
cat << EOF
usage: dotfiles [-h][-u][-p][-d]

syncs dotfiles between ~/dotfiles and ~/

OPTIONS:
 -h print usage
 -u updates dotfiles in ~/
 -p pushes changes to dotfiles in ~/ to ~/dotfiles
 -d view the difference between dotfiles in ~/ and ~/dotfiles
EOF
```