document.addEventListener("DOMContentLoaded", () => {
	const VIDEO_PLAYER = document.querySelector("#Video-Player");
	const VIDEO = document.querySelector("#Video-Player video");
	const VIDEO_MENU = document.querySelector("#Video-Player #Menu");

	// Keypress
	document.addEventListener("keydown", (event) => {
		const ACTIVE = document.activeElement;

		const INPUT = ACTIVE instanceof HTMLInputElement;
		const TEXTAREA = ACTIVE instanceof HTMLTextAreaElement;
		const SELECT = ACTIVE instanceof HTMLSelectElement;

		if (!(INPUT || TEXTAREA || SELECT)) {
			let inputDigits = "";
			const digitPattern = /^Digit(\d)$/;
			console.log(event.key)
			const match = event.code.match(digitPattern);
			if (event.shiftKey && match) {
				let bkmatch = `bk${match[1]}`; // Generates bk0, bk1, bk2, etc.
				load_seconds(VIDEO.id)
					.then(existing => {
						if (existing[bkmatch]) {
							if (event.ctrlKey) {
								update_seconds(VIDEO.id, VIDEO.currentTime, bkmatch);
							} else {
								seek_time(existing[bkmatch]);
							}
						} else {
							console.log(bkmatch);
							update_seconds(VIDEO.id, VIDEO.currentTime, bkmatch);
						}
					})
					.catch(error => {
						update_seconds(VIDEO.id, VIDEO.currentTime, bkmatch);
					});
			} else {
				if (match) {
					inputDigits += match[1];
					seek_time(parseInt(inputDigits) * .1 * VIDEO.duration);
				}
			}

			switch (event.code) {
				case "KeyK":
				case "Space":
					play();
					break;
				case "ArrowRight":
					seek_time(VIDEO.currentTime += 5);
					break;
				case "ArrowLeft":
					seek_time(VIDEO.currentTime -= 5);
					break;
				case "KeyL":
					seek_time(VIDEO.currentTime += 10);
					break;
				case "KeyJ":
					seek_time(VIDEO.currentTime -= 10);
					break;
				case "KeyM":
					mute();
					break;
				case "ArrowUp":
					vol = VIDEO.volume
					if (event.shiftKey) {
						seek_volume(vol += .01);
					} else {
						seek_volume(vol += .05);
					}
					break;
				case "ArrowDown":
					vol = VIDEO.volume
					if (event.shiftKey) {
						seek_volume(vol -= .01);
					} else {
						seek_volume(vol -= .05);
					}
					break;

			}
		}

	});


	// IndexedDB
	const DB = new Dexie("database");

	DB.version(1).stores({
		videos: `&vid, seconds, bk1, bk2, bk3, bk4, bk5, bk6, bk7, bk8, bk9, bk0`,
		settings: `++id, mute, volume, autoplay`,
	});

	async function update_seconds(vid, seconds, column="seconds") {
		try {
			const existing = await DB.videos.where("vid").equals(vid).first();
			// console.log("Checking for video in db.");

			if (existing) {
				update = { [column]: seconds };
				await DB.videos.update(vid, update);
				// console.log("Updated existing video: seconds.");
			} else {
				await DB.videos.add({ vid, seconds});
				// console.log("Created new video.");
			}

		} catch (error) {
			console.log("Uh oh!");
			console.error(error);
		}
	}

	async function update_settings(value = true, column = "mute" ) {
		try {
			const existing = await DB.settings.where("id").equals(1).first();

			if (existing) {
				update = { [column]: value };
				console.log(update)
				await DB.settings.update(1, update);
			} else {
				update = { "mute": true, "volume": .5, "autoplay": 2 }
				await DB.settings.add(update);
			}

		} catch (error) {
			console.log("Uh oh!");
			console.error(error);
		}
	}

	async function load_seconds(vid) {
		try {
			const existing = await DB.videos.where("vid").equals(vid).first();

			if (existing) {
				// console.log("Video found. Returning ${existing.seconds}");
				return existing;
			} else {
				console.log("Video not found. Returning 0.");
				return 0.0;
			}
		} catch (error) {
			console.log("Uh oh!");
			console.error(error);
			return 0.0;
		}
	}

	async function load_settings() {
		try {
			const existing = await DB.settings.where("id").equals(1).first();

			if (existing) {
				return existing;
			} else {
				return false;
			}
		} catch (error) {
			console.log("Uh oh!");
			console.error(error);
			return false;
		}
	}

	// MENU VISIBILITY
	let hoverTimer;

	if (VIDEO.paused) {
		VIDEO_MENU.classList.add("visible");
	} else {
		VIDEO_MENU.classList.remove("visible");
	}

	document.querySelector("body").addEventListener("mousemove", (event) => {
		document.querySelector("body").style.cursor = "auto";
		if (event.target.closest("#Video-Player")) {
			VIDEO_MENU.classList.add("visible");
			clearTimeout(hoverTimer);
			hoverTimer = setTimeout(() => {
				VIDEO_MENU.classList.remove("visible");
				document.querySelector("body").style.cursor = "none";
			}, 3000);
		}
	});

	VIDEO_PLAYER.addEventListener("mouseleave", () => {
		if (!VIDEO.paused) {
			clearTimeout(hoverTimer);
			VIDEO_MENU.classList.remove("visible");
		}
	});

	VIDEO.addEventListener("pause", () => {
		VIDEO_MENU.classList.add("visible");
	});

	VIDEO.addEventListener("play", () => {
		VIDEO_MENU.classList.remove("visible");
	});



	// Play and Pause
	const PLAY_BUTTON = document.querySelector("#Play");
	const PLAY_IMGS = document.querySelectorAll("#Play img");

	function play() {
		VIDEO.paused ? VIDEO.play() : VIDEO.pause();
		PLAY_IMGS.forEach((img) => {
			img.classList.toggle("hidden");
		});
	}

	VIDEO_PLAYER.addEventListener("click", () => {
		if (!event.target.closest("#Menu")) {
			play();
		}
	});

	PLAY_BUTTON.addEventListener("click", () => {
		play();
	});


	// Time
	const PROGRESS = document.querySelector("#Video-Player #Progress");
	const PBAR = document.querySelector("#Video-Player #Progress-Bar");
	const CURRENT_TIME = document.querySelector("#Video-Player #Current-Time");
	const DURATION = document.querySelector("#Video-Player #Duration");


	function seek_time(seconds) {
		VIDEO.currentTime = seconds;
	}

	function format_time(seconds) {
		if (isNaN(seconds) || seconds < 0) return "0:00";
		let hr = Math.floor(seconds / 3600);
		let min = Math.floor((seconds % 3600) / 60);
		let secs = Math.floor(seconds % 60);

		if (hr > 0) {
			return `${hr}:${String(min).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
		} else {
			return `${min}:${String(secs).padStart(2, "0")}`;
		}
	}


	VIDEO.addEventListener("timeupdate", () => {
		update_seconds(VIDEO.id, VIDEO.currentTime, "seconds")
		PROGRESS.style.width = VIDEO.currentTime / VIDEO.duration * 100 + "%";
		CURRENT_TIME.textContent = format_time(VIDEO.currentTime);
		DURATION.textContent = format_time(VIDEO.duration);
	});

	PBAR.addEventListener("click", (event) => {
		var rect = PBAR.getBoundingClientRect();
		var position = event.clientX - rect.left;
		var percentage = position / PBAR.offsetWidth;
		var seconds = percentage * VIDEO.duration
		seek_time(seconds);
	});

	const TIMESTAMPS = document.querySelectorAll("span.timestamp");

	TIMESTAMPS.forEach((timestamp) => {
		timestamp.addEventListener("click", () => {
			timestamp_text = timestamp.textContent;
			timestamp_split = timestamp_text.split(":")
			console.log(timestamp_split[2])
			if (timestamp_split.length === 3) {
				seconds = (parseInt(timestamp_split[0]) * 3600) + (parseInt(timestamp_split[1]) * 60) + parseInt(timestamp_split[2]);
			} else {
				seconds = (parseInt(timestamp_split[0]) * 60) + parseInt(timestamp_split[1])
			}

			VIDEO.currentTime = seconds;
		});
	});

	// Volume
	const MUTE = document.querySelector("#Video-Player #Mute-Button");
	const VOLUME_BAR = document.querySelector("#Video-Player #Volume-Bar");
	const CURRENT_VOLUME = document.querySelector("#Video-Player #Current-Volume");

	function seek_volume(vol) {
		vol = Math.max(0, Math.min(1, vol));
		console.log(vol)
		VIDEO.volume = vol
		CURRENT_VOLUME.style.width = (VIDEO.volume * 100) + "%";
		update_settings(vol, "volume")
		if (VIDEO.volume >= .5 && !VIDEO.muted) {
			MUTE.src = "static/img/high_volume.png";
		} else {
			if (!VIDEO.muted) {
				MUTE.src = "static/img/low_volume.png";
			}
		}
	}

	function mute() {
		if (VIDEO.muted) {
			VIDEO.muted = false;
			seek_volume(VIDEO.volume);
			update_settings(false, "mute");
		} else {
			VIDEO.muted = true;
			MUTE.src = "static/img/mute.png";
			update_settings(true, "mute");
		}
	}

	MUTE.addEventListener("click", () => {
		mute();
	});

	VOLUME_BAR.addEventListener("click", (event) => {
		var rect = VOLUME_BAR.getBoundingClientRect();
		var position = event.clientX - rect.left;
		var seconds = position / VOLUME_BAR.offsetWidth;
		seek_volume(seconds);
	});

	// Autoplay-Loop
	let autoplay = false;
	let autoloop = 2;
	const AUTOLOOP = document.querySelector("#Video-Player #Autoplay-Button");

	function set_autoloop(value) {
		if (value == 0) {
			VIDEO.loop = false;
			autoplay = false;
			console.log("Autoloop value is 0. Nothing will happen when video ends.")
			AUTOLOOP.src = "static/img/no_auto.png";

		} else if (value == 1) {
			VIDEO.loop = false;
			autoplay = true
			console.log("Autoloop value is 1. Play next video when current one ends.")
			AUTOLOOP.src = "static/img/autoplay.png";
		} else {
			autoplay = false;
			VIDEO.loop = true;
			console.log("Autoloop value is 2. Video will loop when video ends.")
			AUTOLOOP.src = "static/img/loop.png";
		}
		update_settings(value, "autoplay");
	}

	AUTOLOOP.addEventListener("click", () => {
		if (autoloop == 2) {
			autoloop = 0;
		} else {
			autoloop += 1;
		}
		set_autoloop(autoloop);
	})

	VIDEO.addEventListener("ended", () => {
		if (autoplay == true) {
			console.log("Place autoplay function here.")
		}
	})

	// Apply loaded settings
	load_seconds(VIDEO.id)
	.then(existing => {
		console.log(existing)
		VIDEO.currentTime = existing.seconds;
	})
	.catch (error => {
		VIDEO.currentTime = 0;
	});

	load_settings()
	.then(settings => {
		if (settings) {
			seek_volume(settings["volume"]);
			if (settings["mute"]) {
				mute();
			}

			set_autoloop(settings["autoplay"]);
			autoloop = settings["autoplay"];
			console.log(settings["autoplay"])
		} else {
			update_settings();
			seek_volume(.5);
		}
	})
	.catch(error => {
		update_settings();
		seek_volume(.5);
	});
});

