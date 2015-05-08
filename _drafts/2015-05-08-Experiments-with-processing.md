---
layout: post
title: Experiments with Processing
tags: learning markup art drawing language
---

I am moving to a new apartment soon and in the process have to buy new furniture. To help with this task
I measured the dimensions of my apartment and drew a rough sketch of what my apartment looks like. But my
inner geek required me to map it out and have a digital copy of the map.

The simplest way to do that would obviously to draw it using paint, but I have been wanting to try processing
for a while and this gave me the perfect reason to try it out. I have tried d3.js for some data visualization
but I wasn't able to use it to it's full potential.



##The Map:
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