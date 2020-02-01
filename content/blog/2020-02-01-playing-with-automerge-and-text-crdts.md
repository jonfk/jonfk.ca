---
title: Playing with Automerge and text CRDTs
date: 2020-02-01
tags: automerge typescript javascript react redux crdt experiment
---

You will find the code and output from the work described here at the following links:
- https://github.com/jonfk/text-crdt-experiment-automerge-ts
- http://jonfk.github.io/text-crdt-experiment-automerge-ts 

## Automerge

I had heard of [Conflict-free replicated data types](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)
before but their use crystalized in my mind recently when I found out about the 
[Automerge](https://github.com/automerge/automerge) Javascript library. It's blurb states that it's a JSON-like data
structure that can be modified concurrently and merged automatically. What this means is that it enables the 
creation of collaborative applications where multiple users could modify the same structure locally, send their changes 
over the network and have their changes merge together even when they made conflicting modifications. It is of course
not perfect since the library cannot know in advance what the right state would be if conflicting modifications happened
on the same property if it doesn't actually support it, in these cases, it chooses one of the updates and saves the
other in it's conflicts. What's great about it's conflict resolution, is that when it chooses one resolution, all the
nodes using automerge receiving the conflicting changes will also resolve it in the same consistent way.

One of the data structures I was interested on was the `Text` data type, which promises to enable text editors to 
become collaborative and allow concurrent updates even offline. With that in mind, a lot of use cases started to pop
into my mind, since I have been thinking about a better way of storing my notes recently. It matches several criteria
that could help be useful for my use case, namely, being in Javascript, I could use it to build a web app to sync my notes
in several places and even enable merging conflicting updates when I come back online from different devices.

But I haven't been working much with frontend web technologies recently, so I decided to start small and experiment with 
the library with a small prototype. This is what I learned while doing that.

## React and Redux

Any good frontend project has to start with some kind of rendering library or framework. I could go vanilla js, or choose
one of the many frontend libraries available today. One that seems to have largely taken over the frontend world these 
days seem to be React. I used React at a startup several years ago and from a cursory look, the ecosystem seems to have
moved forward quite well, the APIs are largely the same, but the breath of libraries, tooling and documentation has 
improved a lot in the intervening years. So I decided to go with a React/Redux rendering stack.

This architecture is quite similar to [Elm](https://elm-lang.org/), which I have been using in some of my side projects.
I should probably write about it sometime, but today isn't about Elm. Let's just say that Elm is a functional programming
language for frontend development with a strong focus on no runtime errors (at least not ones of the typed kind). Since 
it's the tech I have been using the most in my side projects where I need a web frontend, that is the starting point for 
my comparisons.

The first thing I noticed digging around is how much more breath of libraries and integrations there are for a React
application. By comparison in Elm, I found myself feeling a little isolated by lack of libraries or different tooling
from the rest of the web ecosystem.

I also found the improved documentation around React since the last time I used it to be very nice. The React, Redux and
Create React App official websites had a lot of examples and pragmatic use cases to help.

The onboarding process for a new project seems to have been streamlined greatly since I used React. The Create React App
and react-scripts enables you to have a working project from a template and configuration less build pretty quick. You
can of course configure your own bundler but I enjoy being able to start on my project fairly quick and only needing to
configure the bundler once I have a specific need to do that.

## Typescript

I am not big fan of Javascript, it's dynamic type system, it's prototype base inheritance or it's sometimes confusing scoping
rules and it's many other faults don't help when I don't use the language often. So seeing typescript coming up in popularity
in the Javascript ecosystem fills me with much joy. Even if Typescript doesn't have the strictest type system or one that
covers all cases that can occur in Javascript, it's still better than nothing. That is why I wanted to get some familiarity
with it.

After about 15mins on its [documentation](https://www.typescriptlang.org/docs/home.html), I find myself having enough of a
grasp of the language to start using it in a project. So that's encouraging. 
[React](https://react-redux.js.org/using-react-redux/static-typing), 
[Redux](https://redux.js.org/recipes/usage-with-typescript) and 
[create-react-app](https://create-react-app.dev/docs/getting-started#creating-a-typescript-app) all have some documentation 
for using them with typescript, which is also a huge help to get started. I also found that most libraries that I encountered
had typescript types either included with the library or as a `@type/` package.

The only issue I encountered was went I tried to use [immer](https://github.com/immerjs/immer) for my redux reducers. It cause
strange type errors causing the Automerge objects stored in my redux store to not be typed as Automerge types because of the
readonly properties added by immer it seemed. I didn't really debug much further and quickly reverted back to plain reducers.
If I were to use it in the future, I would try to debug the issue, but that does give me pause about adding libraries and
their interactions between each other and typescript.

## Issues with Webpack prod build

The final problem I encountered was at the very end of my experiment. During my whole development, I had been using it's 
development mode to run my app and it was working fine until I decided to run `npm run build`. The production build started
to give me undefined errors on a class method I was calling on an Automerge object. Looking strictly at the code was no help 
since from the typescript source code, I was calling the method correctly to bind `this` and it was working correctly on the
development build. It was only after asking for some help from a coworker with much more experience on the front end that 
we ended up debugging the issue to the bundled and minified code from webpack. It required disabling source maps and locating
the corresponding code in the transpiled output using judiciously placed unique literal strings that we found that the code
wasn't being transpiled to the same output we would expect. The solution we ended up implementing was to add a `.bind()` which
looked something like this.

```js:title=src/utils/automerge.js
...
doc.text.insertAt?.bind(doc.text)(idx, changedText);
...
```

This did the trick but doesn't inspire me with a ton of confidence in the tooling in the Javascript ecosystem.

## Conclusions

This has been a bit of an off the cuff post on my experience getting back into frontend development and my experiment with 
Typescript and the Automerge CRDT library. Overall, I found that the Javascript ecosystem has a huge breath of libraries 
to do almost anything. That Typescript is pretty awesome but the integration with the libraries you want to use might not be
perfect. Bringing libraries to your project can have lots of risks and you should only bring them in if you feel confident
in truly owning those dependencies, and that's especially true in an ecosystem with so many libraries.

Finally, the goal of the experiment to see if Automerge was a viable data structure for a generic note editor, indicated 
to me that although it works amazingly well, it may not be the best match for the potential generic note editor project I had 
in mind. The updates to the Text data structure took a bit too long (moderate updates to the text sometimes took over 4s) and 
the storage overhead of the data structure was also way too high (3KB of text took 650KB of storage for the data structure 
which is about a 200x overhead).

Check out the code here https://github.com/jonfk/text-crdt-experiment-automerge-ts and the webapp is hosted here 
https://jonfk.github.io/text-crdt-experiment-automerge-ts/.

I will keep an eye out for it in the future as it improves. The author is working on improving the performance of the Text 
data structure and overall library as these issue indicate.

- https://github.com/automerge/automerge/issues/212
- https://github.com/automerge/automerge/issues/89
