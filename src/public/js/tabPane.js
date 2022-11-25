function openNav(evt, pane) {
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
    document.getElementById("open_load").focus();
} 
 
window.onload = function() {
    document.getElementById("open_load").focus();
  }  