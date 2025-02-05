function load() {
  const x = new XMLHttpRequest();
  x.open("GET", "/SpendSense/Sidebar/index.html", true);
  x.onload = function () {
    if (x.status === 200) {
      document.getElementById("sidebar").innerHTML = x.responseText;
      
    }
  };
  x.send();
}
window.onload = load();
