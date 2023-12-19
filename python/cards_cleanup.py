import urllib.request as requests
import json
from typing import List

CARDS_FILE = "cards/cards.json"
YGOPROG_ENDPOINT = "https://api.ygoprog.com/api/cards"
BANLIST_INDEX = "banlist/index.json"

header= {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) ' 
			'AppleWebKit/537.11 (KHTML, like Gecko) '
			'Chrome/23.0.1271.64 Safari/537.11',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
			'Accept-Encoding': 'none',
			'Accept-Language': 'en-US,en;q=0.8',
			'Connection': 'keep-alive'}

def determine_subtype(subtypes):
    monster_types = ["Normal", "Ritual", "Fusion", "Link", "Synchro", "Xyz", "Effect"]

    for monster_type in monster_types:
        if monster_type in subtypes:
            return monster_type

    return None

request = requests.Request(YGOPROG_ENDPOINT, None, header)
with requests.urlopen(request) as response:
	cards: List = json.loads(response.read().decode())

names: List = []

with open(BANLIST_INDEX, "r", encoding="utf-8") as f:
	banlists = json.loads(f.read())
	for banlist_name in banlists:
		with open(f"banlist/{banlist_name}", "r", encoding="utf-8") as banlist_file:
			banlist = json.loads(banlist_file.read())
			forbidden = banlist["forbidden"]
			limited = banlist["limited"]
			semilimited = banlist["semilimited"]
			for card in forbidden:
				if not card in names:
					names.append(card)
			for card in limited:
				if not card in names:
					names.append(card)
			for card in semilimited:
				if not card in names:
					names.append(card)

readable_list = [
    {
        "name": card["name"],
        "id": card["id"],
        "type": card["type"],
        **({"subtype": determine_subtype(card["subtype"])} if card["type"] == "Monster" else {}),
    }
    for card in cards
    if card["name"] in names
]


print(f"names: {len(names)}, readable: {len(readable_list)}")

with open(CARDS_FILE, "w", encoding="utf-8") as f:
	json.dump(readable_list, f)