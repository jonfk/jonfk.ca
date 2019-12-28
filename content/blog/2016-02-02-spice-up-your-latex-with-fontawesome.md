---
title: Spice up your LaTeX with Font Awesome
tags: latex documents
date: 2016-02-02
---

LaTeX allows you to create amazing documents which are beautifully typeset. It gives you access to a wide breath of tools and graphics to improve your documents. One of these are the many already available symbols in LaTeX. Here is a comprehensive list of available symbols: [Link](http://www.ctan.org/tex-archive/info/symbols/comprehensive/) [PDF](http://mirrors.ctan.org/info/symbols/comprehensive/symbols-a4.pdf). You can even find symbols by drawing them at this [service](http://detexify.kirelabs.org/classify.html). These include mathematical symbols, phonetic symbols, currency symbols or symbols for various languages.

I found out recently that you can include [Font Awesome](http://fontawesome.io/) icons as symbols in your latex documents using this [CTAN package](https://www.ctan.org/pkg/fontawesome). This allows you to use some modern icons such as the Github or LinkedIn logos to spice up your documents such as a resume if you write it in LaTeX. If you have a full TeX live distribution such as MacTeX, it should be already included. I was able to use it by adding `\usepackage{fontawesome}` to my document and using the `lualatex` command to compile my document. I wasn't able figure out why `xelatex` failed to compile my document. If you do let me know.

The final result:

![My Resume with fontawesome icons](../images/2016-02-02/resume-screenshot.png)

You can checkout the source here: [Link](https://github.com/jonfk/resume)
