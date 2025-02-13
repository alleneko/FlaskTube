const HAMBURGER_BUTTON = document.querySelector("#Hamburger");
const HAMBURGER_MENU = document.querySelector("nav");
const MAIN = document.querySelector("main")


HAMBURGER_BUTTON.addEventListener("click", () => {
	HAMBURGER_MENU.classList.toggle("expand");
	MAIN.classList.toggle("expand");
});