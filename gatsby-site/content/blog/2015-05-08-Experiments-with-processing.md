---
layout: post
title: Experiments with Processing
tags: learning markup art drawing language
---

Processing is a programming language targeted at electronic arts and visual design communities.
It can serve as the foundation for electronic sketchbooks and aims to teach it's target communities
programming in a visual context. At its core processing is a simple programming language with a very
lightweight C-style syntax, similar to Java in which it is implemented.

There are now several implementations of Processing such as the one used on this page using
[Processing.js](http://processingjs.org/). The original one is still the easiest one to use
in my opinion but I haven't given a try to the others very thoroughly.

## The context

I am moving to a new apartment soon and in the process of buying new furniture I have to map out the dimensions
of my apartment. I could do a simple paper sketch or simply draw the map in a paint program but my inner geek
compels me to try out something new. I have tried several declarative visual programming languages but I haven't
found any that I was comfortable with. It may simply be because I am just not made for visual design but I wanted to
give this another chance.

I tried D3.js for data visualizations and a few graphing libraries in javascript but after trying Processing again,
I can state that Processing seems to have the simplest semantics as well as being the most flexible in what it can do.
It even has 3D visualizations!

Without much more ado here is the map of my apartment.

## The Map:
<script src="/js/processing.js"></script>
<script type="text/processing" data-processing-target="mycanvas">
PFont f;

void setup() {
  size(1000, 800);
  f = createFont("Arial",16,true);
}

void draw() {
  textFont(f,12);
  // start with the door
  line(10, 300, 400, 300);
  line(10, 300, 10, 310);
  rect(10, 310, 3, 30);
  line(10, 340, 10, 350);
  text("Front Door",11,325);
  line(10,350,300,350);
  text("258x115",125,320);

  // kitchen
  line(260,300, 260,80);
  line(260,80, 400,80);
  line(400,80, 400,300);
  rect(315, 300, 30,3);
  text("Kitchen", 300, 200);
  text("170", 410,190);

  // kitchen column
  line(400,275, 380,275);
  line(380,300, 380,275);

  // bathroom
  line(220,350, 220,500);
  line(220,500, 300, 500);
  line(300,500, 300,350);
  rect(245,350, 30,3);

  // bedroom
  line(300,350, 300,640);
  line(300,640, 500,640);
  line(500,640, 500,350);
  text("Bedroom", 370, 470);
  text("208",380,625);
  text("287", 475,500);

  // living room
  line(400,80, 835,80);
  line(835,80, 835,350);
  line(835,350, 500,350);
  text("Living room", 550, 200);
  text("435", 570, 95);
  text("305", 805, 170);
  text("142", 800, 345);
  text("235",600,345);

  // tv stand
  rect(720,350, 60,6);
  text("TV Stand", 750, 370);

  // balcony door
  rect(835,100, 3,30);

  // window
  rect(835,180, 4,150);
}
</script>
<canvas id="mycanvas"></canvas>