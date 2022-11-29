function openNav(evt, pane) {
  evt.preventDefault();
  var i, tabcontent;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  var author_lis = document.getElementsByName("author-li");
  for (var i = 0; i < author_lis.length; i++) {
    author_lis[i].className = "inactive-li";
  }
  document.getElementById(pane).style.display = "block";
  evt.currentTarget.className = "active-li";
}

function openAlbum(evt, pane) {
  evt.preventDefault();
  var albums = document.getElementsByName("albums-card");
  for (var i = 0; i < albums.length; i++) {
    albums[i].style = "inactive-album";
  }
  document.getElementById(pane).style.display = "flex";
  evt.currentTarget.className = "active-album";
}


/// Get current date and make the input date value 
document.getElementById('current_date').value = new Date().toISOString().substring(0, 10);