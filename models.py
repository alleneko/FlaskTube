from datetime import datetime
from json import load as jsload

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, Date, Boolean

class Base(DeclarativeBase):
	pass

db = SQLAlchemy(model_class=Base)

class Video(db.Model):
	id: Mapped[int] = mapped_column(primary_key=True)
	video_id: Mapped[str] = mapped_column(unique=True)
	title: Mapped[str]
	channel_id: Mapped[str]
	views: Mapped[int]
	tags: Mapped[str]
	likes: Mapped[int]
	channel: Mapped[str]
	timestamp: Mapped[str]
	description: Mapped[str]

	def save(vid):
		with open(f"static/vid/{vid}/{vid}.info.json") as json_file:
			json = jsload(json_file)
		new_video = Video(
			video_id = vid,
			title = json["title"],
			channel_id = json["uploader_id"],
			channel = json["uploader"],
			views = json["view_count"],
			description = json["description"],
			likes = json["like_count"],
			tags = ",".join(json["tags"]),
			timestamp = str(json["timestamp"])
		)
		db.session.add(new_video)
		db.session.commit()


class Comment(db.Model):
	id: Mapped[int] = mapped_column(primary_key=True)
	comment_id: Mapped[str]
	parent: Mapped[str]
	commenter_id: Mapped[str]
	username: Mapped[str]
	thumbnail: Mapped[str]
	favorited: Mapped[bool]
	timestamp: Mapped[str]
	pinned: Mapped[bool]
	text: Mapped[str]
	likes: Mapped[int]
	video_id: Mapped[str]

	def save(vid):
		with open(f"static/vid/{vid}/{vid}.info.json") as json_file:
			json = jsload(json_file)
		for comment in json["comments"]:
			comment_check = Comment.query.filter_by(comment_id=comment["id"]).first()
			if not comment_check:
				new_comment = Comment(
					comment_id = comment["id"],
					parent = comment["parent"],
					commenter_id = comment["author_id"],
					username = comment["author"],
					thumbnail = comment["author_thumbnail"],
					favorited = comment["is_favorited"],
					timestamp = str(comment["timestamp"]),
					pinned = comment["is_pinned"],
					text = comment["text"],
					likes = comment["like_count"],
					video_id = vid
				)
				db.session.add(new_comment)
				db.session.commit()

class Creator(db.Model):
	id: Mapped[int] = mapped_column(primary_key=True)
	channel: Mapped[str]
	channel_id: Mapped[str]
	followers: Mapped[int]
	description: Mapped[str]
	tags: Mapped[str]

	def save(cid):
		with open(f"static/chan/{cid}/{cid}.info.json") as json_file:
			json = jsload(json_file)
		new_chan = Creator(
			channel_id = json["uploader_id"],
			channel = json["uploader"],
			followers = json["channel_follower_count"],
			description = json["description"],
			tags = ",".join(json["tags"])
		)
		db.session.add(new_chan)
		db.session.commit()