import re
import math
from datetime import datetime

def shorten_num(num):
	"""
		shorten large numbers by converting them
		into human-readable formats:

		"B" for billions,
		"M" for millions,
		and "k" for thousands.
	"""
	if num >= 1_000_000_000:
		return f"{math.floor(num / 1_000_000_000 * 10) / 10:.1f}B"
	if num >= 1_000_000:
		print(num / 1000000)
		return f"{math.floor(num / 1_000_000 * 10) / 10:.1f}M"
	if num >= 1_000:
		return f"{math.floor(num / 1_000 * 10) / 10:.1f}k"
	return str(num)

def format_num(num):
	return f"{num:,}"

def format_date(timestamp):
	date = datetime.fromtimestamp(int(timestamp))
	return date.strftime("%B %d, %Y")

def time_ago(timestamp):
	now = datetime.now()
	date = datetime.fromtimestamp(int(timestamp))
	print(date)
	delta = now - date

	# Calculate years, months, days, hours, minutes, and seconds
	total_seconds = delta.total_seconds()
	
	# Calculate years and months
	years = total_seconds // (365.25 * 24 * 60 * 60)
	remaining_seconds = total_seconds - years * (365.25 * 24 * 60 * 60)
	
	months = remaining_seconds // (30 * 24 * 60 * 60)
	remaining_seconds -= months * (30 * 24 * 60 * 60)
	
	days = remaining_seconds // (24 * 60 * 60)
	remaining_seconds -= days * (24 * 60 * 60)
	
	hours = remaining_seconds // 3600
	remaining_seconds -= hours * 3600
	
	minutes = remaining_seconds // 60
	remaining_seconds -= minutes * 60
	
	seconds = remaining_seconds
	
	# Determine the highest non-zero unit and return it
	if years > 0:
		return f"{int(years)} year{'s' if years > 1 else ''} ago"
	elif months > 0:
		return f"{int(months)} month{'s' if months > 1 else ''} ago"
	elif days > 0:
		return f"{int(days)} day{'s' if days > 1 else ''} ago"
	elif hours > 0:
		return f"{int(hours)} hour{'s' if hours > 1 else ''} ago"
	elif minutes > 0:
		return f"{int(minutes)} minute{'s' if minutes > 1 else ''} ago"
	elif seconds > 0:
		return f"{int(seconds)} second{'s' if seconds > 1 else ''} ago"
	return "Just now"


def find_links(string):
	url_pattern = r'(?:https?:\/\/)?\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b(?:[^\s]*)\b'
	time_pattern = r'^(\d{1,6}):([0-5]?\d)(?::([0-5]?\d))?$'

	def convert_to_link(word):
		print(re.match(time_pattern, word))
		if re.match(url_pattern, word):
			return f"<a href='{word}' target='_blank' rel='noopener noreferrer'>{word}</a>"
		if re.match(time_pattern, word):
			return f"<span class='timestamp'>{word}</span>"
		return word

	new_string = [convert_to_link(word) for word in string.split()]
	return " ".join(new_string)