# -*- coding: utf-8 -*-
'''
feed.py

This file is handles retrieval of RSS feeds and formats them so they can be
used in our webpages.

use:
    feeds, entries = load_feeds()
'''
import re
import uuid
import json
import feedparser

# just use the one for now.
feed_urls = [
    "http://feeds.bbci.co.uk/news/rss.xml?edition=uk",
    "https://www.theguardian.com/world/rss"

    # ... add more feeds here. If you add too many this will get really slow.
    # To address this we will have to think of some smarter approaches.
]


def load_feeds(feed_urls=feed_urls, n=20):
    "return dictionary of feeds and a list of n most recent entries."
    # A feed is a RSS source like linked in the feed_urls. We need to store
    # links to their feed and images.
    our_feeds = {}
    # An entry is an article that comes from an rss feed. We will store all
    # article entiries from all rss feeds in one list.
    our_entries = []
    out = open('feeds/articles.ndjson', 'w+')
    for url in feed_urls:
        # use the feedparser module to parse the feed from xml into a python
        # data structure.
        f = feedparser.parse(url)
        # add this feed to our feed dict.
        our_feeds[f.feed.title] = f.feed
        # loop through the entries in the parsed feed.
        for item in f.entries:
            # Create a link to the entries origin. this is so we dont have to
            # store the complete feed information in each entry.
            item['feed_title'] = f.feed.title
            item['uuid'] = uuid.uuid4().hex[:10]
            item.summary = clean_html(item.summary)
            out.write(json.dumps(item) + '\n')
            our_entries.append(item)
    out.close()
    # sort by date and return the n most recent items.
    our_entries = sorted(our_entries, key=most_recent, reverse=True)[:n]
    return (our_feeds, our_entries)


def most_recent(item):
    "sort helper to return stories sorted by date"
    return item.published_parsed


def clean_html(raw_html):
    "remove html tags"
    return re.sub(tag_pattern, ' ', raw_html)

tag_pattern = re.compile('<.*?>|nbsp')