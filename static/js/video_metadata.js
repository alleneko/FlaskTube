function format_number(num) {
	if (num >= 1_000_000_000) {
		return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + "B";
	} else if (num >= 1_000_000) {
		return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + "M";
	} else if (num >= 1_000) {
		return (num / 1_000).toFixed(1).replace(/\.0$/, '') + "k";
	} else {
		return num.toString();
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const GET_CREATOR_META = document.querySelector("button#DL-Creator");
	const Creator_ID = GET_CREATOR_META.classList[0];
	const CREATOR_IMG = document.querySelector("img#Creator-Image");
	const SUBS = document.querySelector("p#Subscribers");

	GET_CREATOR_META.addEventListener("click", () => {
		fetch("/get_channel_meta", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ creator: Creator_ID })
		})
		.then(response => response.json())
		.then(data => {
			console.log(data)
			CREATOR_IMG.src = "static/chan/" + data["id"] + "/" + data["id"] + ".jpg";
			SUBS.textContent = format_number(data["followers"]) + " Subscribers"
			SUBS.title = data["followers"].toLocaleString();
			return data;
		})
		.catch(error => console.error("ERROR:", error))
	});
});