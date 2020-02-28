# -*- coding: utf-8 -*-
'''
Here we handle the template veiws.
'''
from flask import render_template

from src.app import app
from src.app import feed


@app.route('/')
def index():
    "This is returning our home page"
    # variables passed to the render_template can be used in the template that
    # is being rendered. So here the index.html file can use the dict `message`
    return render_template("index.html", message=message)

message = {
    "title": "Hello world",
    "text": "This is just a placeholder for something awesome."
}

@app.route('/feed')
def feed_page():
    # this function is loading our feeds and returning them when the address
    # `/feed` is visited.
    feeds, entries = feed.load_feeds()
    return render_template("feed.html", feeds=feeds, entries=entries)

# handle 404 errors.
@app.errorhandler(404)
def page_not_found(e):
    return "404 page not found 💩", 404