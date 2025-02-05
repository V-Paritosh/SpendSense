const waitForSidebar = setInterval(() => {
  const sidebar = document.getElementById("sidebar");

  if (sidebar) {
    clearInterval(waitForSidebar);

    const currentPath = window.location.pathname;
    console.log("Current Path:", currentPath);

    const navLinks = {
      dashboard: "/SpendSense/SpendSense/Dashboard/index.html",
      budget: "/SpendSense/SpendSense/Budget/index.html",
      transactions: "/SpendSense/SpendSense/Transactions/index.html",
    };

    if (currentPath != "") {
      for (const id in navLinks) {
        if (currentPath === navLinks[id]) {
          console.log(`Found active link: ${id}`);
          document.getElementById(id).classList.add("active");
        }
      }
    } else {
      document.getElementById("home").classList.add("active");
    }
  }
}, 100);
