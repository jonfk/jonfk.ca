---
layout: post
title: What I learned from Functional Programming Principles
tags: learning language functional programming scala coursera
---

Functional Programming Principles is a course taught at Ecole polytechnique fédérale de lausanne and
on coursera by Prof. Martin Odersky.

I originally took the class to get familiar with scala before tackling the more interesting
class by Martin 'Principles of Reactive Programmin' which is about asynchronous computation and
distributed computation. I had already had an intro to functional programming through SML in the
COMP302 class taught at McGill by the brilliant Prof. Brigitte Pientka.

The class starts with a model of evaluation for functional programming that is a useful mental
model of how to think about functional programs. It is interesting to note that SICP does a similar
introduction to programming which I think is better than the usual hello world program many intro
cs classes start with.

The rest of the class is about functional programming in scala and the various datastructures
available in the extensive scala standard library, such as lists, sets, maps and streams.
The type hierarchy of the collections library is as follows:

```bash
+--Iterable
   +--Seq
      +--IndexedSeq
         +--Vector
         +--(Array)  Imported from java does not subclass IndexSeq but
         +--(String) Use wrappers to behave like IndexedSeq
      +--LinearSeq
         +--List
   +--Set
   +--Map
```

Martin also when through some inductive proofs on properties of lists and trees. He also showed
how for-expressions can be mapped to map and flatMap and can be more readable in many situations.
The course ended with how to operate on lazy collections such as streams.

I liked the course overall as it was a good refresher on functional programming as well and a way
to gain familiarity to Scala which is probably a factor for why Scala is gaining popularity in
some circles. Scala is an interesting language which mixes object oriented programming with
functional programming in a way that feels very natural.