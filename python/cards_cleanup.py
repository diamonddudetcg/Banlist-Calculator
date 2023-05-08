import urllib.request as requests
import json
from typing import List

cardsFile = "cards/cards.json"
ygoprog_endpoint = "https://api.ygoprog.com/api/cards"

header= {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) ' 
			'AppleWebKit/537.11 (KHTML, like Gecko) '
			'Chrome/23.0.1271.64 Safari/537.11',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
			'Accept-Encoding': 'none',
			'Accept-Language': 'en-US,en;q=0.8',
			'Connection': 'keep-alive'}

request = requests.Request(ygoprog_endpoint, None, header)
with requests.urlopen(request) as response:
	cards: List = json.loads(response.read().decode())


readable_list = [{"name": obj['name'], "id": obj['id'], "type": obj['type'], "subtype": obj['subtype']} for obj in cards]


with open(cardsFile, "w") as f:
    json.dump(readable_list, f)