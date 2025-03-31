document.addEventListener("DOMContentLoaded", function () {
  let toggleBtn = document.getElementById("toggleBtn");
  let content = document.querySelector(".toggle-content");
  let menuIcon = document.querySelector(".menu-icon");
  let closeIcon = document.querySelector(".close-icon");

  if (!toggleBtn) {
    console.error("toggleBtn not found!");
    return;
  }

  toggleBtn.addEventListener("click", function () {
    content.classList.toggle("show");

    if (content.classList.contains("show")) {
      menuIcon.style.display = "none";
      closeIcon.style.display = "inline-block";
    } else {
      menuIcon.style.display = "inline-block";
      closeIcon.style.display = "none";
    }
  });
});
