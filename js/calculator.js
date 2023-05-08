filenames = [
    "2023-02-06.json",
    "2022-11-21.json",
    "2022-10-03.json",
    "2022-05-17.json",
    "2022-02-07.json",
    "2021-10-01.json",
    "2021-07-01.json",
    "2021-03-15.json",
    "2020-12-15.json",
    "2020-09-14.json",
    "2020-06-15.json",
    "2020-04-01.json",
    "2020-01-20.json",
    "2019-10-14.json",
    "2019-07-15.json",
    "2019-04-29.json",
    "2019-01-29.json",
    "2018-12-03.json",
    "2018-09-17.json",
    "2018-05-21.json",
    "2018-02-05.json",
    "2017-11-06.json",
    "2017-09-18.json",
    "2017-06-12.json",
    "2017-03-31.json",
    "2016-08-29.json",
    "2016-04-11.json",
    "2016-02-08.json",
    "2015-11-09.json",
    "2015-07-16.json",
    "2015-04-01.json",
    "2015-01-01.json",
    "2014-10-01.json",
    "2014-07-14.json",
    "2014-04-01.json",
    "2014-01-01.json",
    "2013-10-11.json",
    "2013-09-01.json",
    "2013-03-01.json",
    "2012-09-01.json",
    "2012-03-01.json",
    "2011-09-01.json",
    "2011-03-01.json",
    "2010-09-01.json",
    "2010-03-01.json",
    "2009-09-01.json",
    "2009-03-01.json",
    "2008-09-01.json",
    "2008-05-09.json",
    "2008-03-01.json",
    "2007-09-01.json",
    "2007-06-01.json",
    "2007-03-01.json",
    "2006-09-01.json",
    "2006-04-01.json",
    "2005-10-01.json",
    "2005-04-01.json",
    "2004-10-01.json",
    "2004-08-25.json",
    "2004-04-19.json",
    "2004-02-02.json",
    "2003-11-17.json",
    "2003-08-25.json",
    "2003-07-08.json",
    "2003-05-08.json",
    "2003-04-01.json",
    "2002-12-01.json",
    "2002-10-01.json",
    "2002-07-01.json",
    "2002-05-01.json",
    "2002-03-01.json"
]

function findCard(cardname, cardsData) {
	for (const rawCard of cardsData) {
		if (rawCard.name.toLowerCase() === cardname.toLowerCase()) {
			return rawCard
		}
	}
	return null
}

function convertArrayToNewData(limitArray, cardsData, legalCopies) {
	var categorizedCards = []
	for (const cardname of limitArray) {
		card = findCard(cardname, cardsData)
		if (card != null) {
			var categoryId = 0
			if (card.type === "Monster") {
				if (card.subtype.includes("Normal")) {
					categoryId = 1
				} else if (card.subtype.includes("Ritual")) {
					categoryId = 3
				} else if (card.subtype.includes("Fusion")) {
					categoryId = 4
				} else if (card.subtype.includes("Link")) {
					categoryId = 5
				} else if (card.subtype.includes("Synchro")) {
					categoryId = 6
				} else if (card.subtype.includes("Xyz")) {
					categoryId = 7
				} else if (card.subtype.includes("Effect")) {
					categoryId = 2
				}
			} else if (card.type === "Spell") {
				categoryId = 98
			} else if (card.type === "Trap") {
				categoryId = 99
			}
			categorizedCards.push(
				{
					name: cardname,
					category: categoryId,
					id: card.id,
					copies: legalCopies
				}
			)
		}
	}
	return categorizedCards
}

async function loadCards(){
	const cardsResponse = await fetch('cards/cards.json');
	const cardsData = await cardsResponse.json();
	return cardsData
}

async function loadData(closestDate) {
	try {
		const closestFilename = `banlist/${closestDate}`;

		const banlistResponse = await fetch(closestFilename);
		const banlistData = await banlistResponse.json();

		const cardsData = await loadCards()

		const categorizedCards = {
			forbidden: convertArrayToNewData(banlistData.forbidden, cardsData, 0),
			limited: convertArrayToNewData(banlistData.limited, cardsData, 1),
			semilimited: convertArrayToNewData(banlistData.semilimited, cardsData, 2)
		};

		return categorizedCards
	} catch (error) {
		console.error(error);
	}
	return {
		forbidden: [],
		limited: [],
		semilimited: []
	}
}

function createTableRow(css_class, card_type, card_id, card_name, card_status) {
	return `<tr class="${css_class}">
		<td>${card_type}</td>
		<td><a href="https://yugipedia.com/wiki/${card_id}">${card_name}</a></td>
		<td>${card_status}</td>
	</tr>`;
}

function populateTable(cardList, div, crossData, status) {
	div.innerHTML = '<div class="separator"></div>';
	const categories = [
		{ id: 1, name: "Monster", classname: "cardlist_monster" },
		{ id: 2, name: "Monster/Effect", classname: "cardlist_effect" },
		{ id: 3, name: "Monster/Ritual", classname: "cardlist_ritual" },
		{ id: 4, name: "Monster/Fusion", classname: "cardlist_fusion" },
		{ id: 5, name: "Monster/Link", classname: "cardlist_link" },
		{ id: 6, name: "Monster/Synchro", classname: "cardlist_synchro" },
		{ id: 7, name: "Monster/Xyz", classname: "cardlist_xyz" },
		{ id: 98, name: "Spell", classname: "cardlist_spell" },
		{ id: 99, name: "Trap", classname: "cardlist_trap" }
	];

	const table = document.createElement("table");
	table.innerHTML = `
		<thead>
		<tr align="center" height="35" class="cardlist_atitle">
			<th width="180">Type</th>
			<th width="600">Card Name</th>
			<th width="180">Status</th>
			<th width="220">Remarks</th>
		</tr>
		</thead>
		<tbody>
		</tbody>
	`;
	div.appendChild(table);

	// Populate the table
	for (const category of categories) {
		const cardsWithCategory = cardList.filter(card => card.category === category.id);

		cardsWithCategory.sort((a, b) => a.name.localeCompare(b.name));

		cardsWithCategory.forEach(card => {
			const row = table.insertRow();
			const typeCell = row.insertCell();
			const nameCell = row.insertCell();
			const statusCell = row.insertCell();
			const remarksCell = row.insertCell();

			typeCell.textContent = category.name; // Replace with the card type variable
			nameCell.innerHTML = `<a href="https://yugipedia.com/wiki/${card.id}">${card.name}</a>`; // Replace with the card ID and name variables
			statusCell.textContent = status; // Replace with the card status variable
			
			const remarks = crossData.filter(obj => obj.id === card.id);

			if (remarks.length == 1){
				oldCopies = remarks[0].oldCopies
				if (oldCopies == 3){
					remarksCell.textContent = "New"
				} else if (oldCopies == 2){
					remarksCell.textContent = "Was Semi-Limited"
				} else if (oldCopies == 1){
					remarksCell.textContent = "Was Limited"
				} else if (oldCopies == 0){
					remarksCell.textContent = "Was Forbidden"
				}
			} 

			row.classList.add(category.classname); // Add the CSS class to the table row
		});
	}
}

function populateTables(categorizedData, unlimited, crossData) {
	const forbiddenTable = document.getElementById("cardlist_forbidden")
	const limitedTable = document.getElementById("cardlist_limited")
	const semilimitedTable = document.getElementById("cardlist_semilimited")
	const unlimitedTable = document.getElementById("cardlist_unlimited")

	if (categorizedData.forbidden.length > 0) {
		populateTable(categorizedData.forbidden, forbiddenTable, crossData, "Forbidden")
	} else {
		forbiddenTable.innerHTML = ""
	}
	if (categorizedData.limited.length > 0) {
		populateTable(categorizedData.limited, limitedTable, crossData, "Limited")
	} else {
		limitedTable.innerHTML = ""
	}
	if (categorizedData.semilimited.length > 0) {
		populateTable(categorizedData.semilimited, semilimitedTable, crossData, "Semi-Limited")
	} else {
		semilimitedTable.innerHTML = ""
	}
	if (unlimited.length > 0){
		populateTable(unlimited, unlimitedTable, crossData, "Unlimited")
	} else {
		unlimitedTable.innerHTML = ""
	}
}

function crossData(previousData, newData) {
	oldForbidden = previousData.forbidden
	oldLimited = previousData.limited
	oldSemilimited = previousData.semilimited

	newForbidden = newData.forbidden
	newLimited = newData.limited
	newSemilimited = newData.semilimited

	oldList = []
	for (const list of [oldForbidden, oldLimited, oldSemilimited]) {
		for (const card of list) {
			oldList.push(card)
		}
	}

	newList = []
	for (const list of [newForbidden, newLimited, newSemilimited]){
		for (const card of list){
			newList.push(card)
		}
	}

	changes = []

	// Check for changes within the banlist: From 0 to 1 or 2, from 1 to 0 or 2 and from 2 to 0 or 1
	for (const card1 of oldList){
		for (const card2 of newList){
			if (card1.id === card2.id){
				// Check the number of legal copies
				if (card1.copies != card2.copies){
					// Legal copies have changed: add it to changes
					changes.push({
						id: card1.id,
						name:card1.name,
						oldCopies: card1.copies,
						newCopies: card2.copies
					})
				}
			}
		}
	}
	// Check for removals within the new banlist: From 0, 1 or 2 to 3
	for (const card1 of oldList){
		var found = false
		for (const card2 of newList){
			if (card1.id === card2.id){
				found = true
			}
		}
		if (!found){
			// Card is no longer on banlist
			changes.push({
				id: card1.id,
				name:card1.name,
				oldCopies: card1.copies,
				newCopies: 3
			})
		}
	}
	// Check for new entries into the banlist: From 3 to 0, 1 or 2
	for (const card1 of newList){
		var found = false
		for (const card2 of oldList){
			if (card1.id === card2.id){
				found = true
			}
		}
		if (!found){
			changes.push({
				id:card1.id,
				name:card1.name,
				oldCopies: 3,
				newCopies: card1.copies
			})
		}
	}
	return changes
}

const dropdown = document.getElementById('fileDropdown');

filenames.forEach(filename => {
	const option = document.createElement('option');
	option.text = new Date(filename.replace('.json', '')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	option.value = filename;
	dropdown.add(option);
});

function loadBanlist(dropdown){
	dropdown.disabled = true
	const selectedValue = dropdown.value;
	const selectedIndex = dropdown.selectedIndex;
	const prevIndex = selectedIndex + 1 < dropdown.options.length ? selectedIndex + 1 : -1;
	const prevValue = prevIndex >= 0 ? dropdown.options[prevIndex].value : null;

	if (!prevValue) {
		loadData(selectedValue).then(data =>
			populateTables(data, [], [])
		)
	} else {
		loadCards().then(
			cards => loadData(prevValue).then(
				oldData => loadData(selectedValue).then(newData => {
					const changes = crossData(oldData, newData);
					const newlyUnlimitedNames = changes.filter(card => card.newCopies === 3).map(card => card.name);
					unlimited = convertArrayToNewData(newlyUnlimitedNames, cards, 3)
					populateTables(newData, unlimited, changes);
					dropdown.disabled = false
				})
			)
		)
	}
}

dropdown.addEventListener('change', function () {
	loadBanlist(this)
});

loadBanlist(dropdown)
