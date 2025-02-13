from os import listdir, remove
import json

from flask import Flask, render_template, request, jsonify

from downloader import *
from models import db, Video, Comment, Creator
from helper import *

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///project.db"

app.jinja_env.filters["shorten_num"] = shorten_num
app.jinja_env.filters["format_num"] = format_num
app.jinja_env.filters["format_date"] = format_date
app.jinja_env.filters["time_ago"] = time_ago
app.jinja_env.filters["find_links"] = find_links


db.init_app(app)

with app.app_context():
	db.create_all()

@app.route("/watch")
def video():
	vid = request.args.get("yt")
	if not vid in listdir("static/vid/"):
		download_metadata(vid)
	if not vid + ".info.json" in listdir(f"static/vid/{vid}"):
		download_metadata(vid)

	video_check = Video.query.filter_by(video_id=vid).first()
	if not video_check:
		Video.save(vid)

	video_info = Video.query.filter_by(video_id=vid).first()
	comments = Comment.query.filter_by(video_id=vid).all()
	creator_check = Creator.query.filter_by(channel_id=video_info.channel_id).first()

	if vid + ".mp4" not in listdir(f"static/vid/{vid}"):
		download_video(vid)

	video_info.views += 1
	db.session.commit()

	return render_template(
		"video.html",
		video=video_info,
		comments=comments,
		creator=creator_check)

@app.route("/get_channel_meta", methods=["POST"])
def get_channel_meta():
	creator_id = request.json["creator"]
	print(creator_id)
	download_channel_meta(creator_id)

	if creator_id in listdir("static/chan"):
		print("Creator successfully downloaded.")
		for item in listdir(f"static/chan/{creator_id}"):
			if creator_id not in item:
				remove(f"static/chan/{creator_id}/{item}")

		creator_check = Creator.query.filter_by(channel_id=creator_id).first()
		if not creator_check:
			print("Saving creator data to db.")
			Creator.save(creator_id)
		creator_check = Creator.query.filter_by(channel_id=creator_id).first()
		print(creator_check)
		if creator_check:
			return jsonify({
						"id": creator_check.channel_id,
						"creator": creator_check.channel,
						"followers": creator_check.followers
						})
		else:
			return jsonify({"error": "Creator was not saved to database."})
	print("Creator not successfully downloaded.")
	return jsonify({"error": "Creator was not downloaded."})

if __name__ == "__main__":
	app.run(debug=True)