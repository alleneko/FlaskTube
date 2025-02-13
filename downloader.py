from yt_dlp import YoutubeDL

def download_metadata(vid, source="https://www.youtube.com/watch?v="):
	params = {
		"writedescription": True,
		"writeinfojson": True,
		"clean_infojson": True,
		"writethumbnail": True,
		"allow_playlist_files": True,
		"writesubtitles": True,
		"writeautomaticsub": True,
		"subtitleslangs": ["en", "ja"],
		"skip_download": True,
		"age_limit": 100,
		"outtmpl": "static/vid/%(id)s/%(id)s.%(ext)s"
	}
	with YoutubeDL(params) as DL:
		DL.download([source + vid])

def download_comments(vid, source="https://www.youtube.com/watch?v="):
	params = {
		"writeinfojson": True,
		"outtmpl": "static/vid/%(id)s/%(id)s.%(ext)s",
		"clean_infojson": True,
		"getcomments": True,
		"skip_download": True,
		"age_limit": 100
	}
	with YoutubeDL(params) as DL:
		DL.download([source + vid])

def download_video(vid, source="https://www.youtube.com/watch?v="):
	params = {
		"format": "bv[height<=1440]+ba/b[height<=1440]",
		"outtmpl": "static/vid/%(id)s/%(id)s.%(ext)s",
		"writesubtitles": True,
		"subtitleslangs": ["en", "ja"],
		"merge_output_format": "mp4",
		"writeinfojson": False,
		"getcomments": False,
		"writethumbnail": True,
		"age_limit": 100
	}
	with YoutubeDL(params) as DL:
		DL.download([source + vid])

def download_channel_meta(cid, source="https://www.youtube.com/"):
	params = {
		"writedescription": True,
		"writeinfojson": True,
		"clean_infojson": True,
		"writethumbnail": True,
		"skip_download": True,
		"age_limit": 100,
		"outtmpl": "static/chan/%(id)s/%(id)s.%(ext)s",
		"extract_flat": True,
		"playlist_items": "1:2",
		"quiet": True
	}

	with YoutubeDL(params) as DL:
		DL.download([source + cid])