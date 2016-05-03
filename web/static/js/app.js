// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"
import m from "mithril"
// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"
document.addEventListener("DOMContentLoaded", function(event) {
  if (document.getElementById("close-alert") != null) { document.getElementById("close-alert").addEventListener("click",function(e){
    document.getElementById("close-alert").parentNode.style.display = "none";
  })};
  })

let App = {
  vm: {},
  controller(){ this.vm = App.vm; },
  view(ctrl){
    return m("div", {class: "o-grid"}, [
      m("div", {class: "chat-column o-grid__col o-grid__col--2-of-12"},
      	m("div", {class: "chat-card c-card c-card--floating is-selected"},
      	  m("h3", "Talks")
      	)
      ),
      m("div", {class: "chat-column o-grid__col o-grid__col--8-of-12"},
      	m("div", {class: "chat-card c-card c-card--floating is-selected"},
      	  m("h3", "Chat")
      	)
      ),
      m("div", {class: "chat-column o-grid__col o-grid__col--2-of-12"},
      	m("div", {class: "chat-card c-card c-card--floating is-selected"},
      	  m("h3", "Online Users")
      	)
      ),
    ])
  }

}

m.module(document.getElementById("main"), App);
