function openNav(evt, pane) {
  evt.preventDefault();
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(pane).style.display = "block";
  evt.currentTarget.className += " active";
  document.getElementById("Home").focus();
}

window.onload = function () {
  document.getElementById("Home").focus();
};

const input = document.getElementById("Home");
const body = document.getElementById("Home");
body.onload = myFunction;

function myFunction() {
  window.addEventListener("load", (e) => {
    input.focus(); // adding the focus
  });
}

