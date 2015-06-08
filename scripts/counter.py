#!/usr/bin/env python

# Count the most frequent words

import requests
import json
from collections import Counter

URL = 'https://data.cityofnewyork.us/resource/xx67-kt59.json?$limit=50000'
FILENAME = 'words.txt'

def collect():
    resp = requests.get(url)

    records = resp.json()

    with open(FILENAME, 'wb+') as f:
        for record in records:
            try:
                street = record['street'].lower()
                f.write(' ' + street)
            except:
                print 'error writing record: ' + record


def count():

    with open(FILENAME, 'r') as f:
        wordcount = Counter(f.read().split())

    wordcount = sorted(wordcount.items(), key=lambda x: x[1], reverse=False)
    for item in wordcount:
        print item

if __name__ == '__main__':
    count()
