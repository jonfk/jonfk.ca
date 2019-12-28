var script = document.querySelector("#wilks-elm-app");
script.addEventListener("load", function() {
  var appDiv = document.getElementById("wilks-app");
  var app = Elm.Main.embed(appDiv);
});
