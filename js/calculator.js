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
				if (card.subtype === "Normal") {
					categoryId = 1
				} else if (card.subtype === "Ritual") {
					categoryId = 3
				} else if (card.subtype === "Fusion") {
					categoryId = 4
				} else if (card.subtype === "Link") {
					categoryId = 5
				} else if (card.subtype === "Synchro") {
					categoryId = 6
				} else if (card.subtype === "Xyz") {
					categoryId = 7
				} else if (card.subtype === "Effect") {
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

async function loadCards() {
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
		<td><a href="https://yugipedia.com/wiki/${card_id.toString().padStart(8, '0')}">${card_name}</a></td>
		<td>${card_status}</td>
	</tr>`;
}

function populateTable(cardList, div, crossData, status, checked) {
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
			const remarks = crossData.filter(obj => obj.id === card.id);
			skip = false
			if (checked && remarks.length == 0){
				skip = true
			}
			if (!skip){
				const row = table.insertRow();
				const typeCell = row.insertCell();
				const nameCell = row.insertCell();
				const statusCell = row.insertCell();
				const remarksCell = row.insertCell();

				typeCell.textContent = category.name; // Replace with the card type variable
				nameCell.innerHTML = `<a href="https://yugipedia.com/wiki/${card.id}">${card.name}</a>`; // Replace with the card ID and name variables
				statusCell.textContent = status; // Replace with the card status variable


				if (remarks.length == 1) {
					oldCopies = remarks[0].oldCopies
					if (oldCopies == 3) {
						remarksCell.textContent = "New"
					} else if (oldCopies == 2) {
						remarksCell.textContent = "Was Semi-Limited"
					} else if (oldCopies == 1) {
						remarksCell.textContent = "Was Limited"
					} else if (oldCopies == 0) {
						remarksCell.textContent = "Was Forbidden"
					}
				}

				row.classList.add(category.classname); // Add the CSS class to the table row
			}
		});
	}
}

function populateTables(categorizedData, unlimited, crossData, checked) {
	const forbiddenTable = document.getElementById("cardlist_forbidden")
	const limitedTable = document.getElementById("cardlist_limited")
	const semilimitedTable = document.getElementById("cardlist_semilimited")
	const unlimitedTable = document.getElementById("cardlist_unlimited")

	if (categorizedData.forbidden.length > 0) {
		if (checked){
			const filteredForbidden = categorizedData.forbidden.filter((card) =>
				crossData.some((crossCard) => crossCard.id === card.id)
			);
			if (filteredForbidden.length > 0){
				populateTable(categorizedData.forbidden, forbiddenTable, crossData, "Forbidden", checked)
			} else {
				forbiddenTable.innerHTML = ""
			}
		} else {
			populateTable(categorizedData.forbidden, forbiddenTable, crossData, "Forbidden", checked)
		}
	} else {
		forbiddenTable.innerHTML = ""
	}

	if (categorizedData.limited.length > 0) {
		if (checked){
			const filteredLimited = categorizedData.limited.filter((card) =>
				crossData.some((crossCard) => crossCard.id === card.id)
			);
			if (filteredLimited.length > 0){
				populateTable(categorizedData.limited, limitedTable, crossData, "Limited", checked)
			} else {
				limitedTable.innerHTML = ""
			}
		} else {
			populateTable(categorizedData.limited, limitedTable, crossData, "Limited", checked)
		}
	} else {
		limitedTable.innerHTML = ""
	}

	if (categorizedData.semilimited.length > 0) {
		if (checked){
			const filteredSemiimited = categorizedData.semilimited.filter((card) =>
				crossData.some((crossCard) => crossCard.id === card.id)
			);
			if (filteredSemiimited.length > 0){
				populateTable(categorizedData.semilimited, semilimitedTable, crossData, "Semi-Limited", checked)
			} else {
				semilimitedTable.innerHTML = ""
			}
		} else {
			populateTable(categorizedData.semilimited, semilimitedTable, crossData, "Semi-Limited", checked)
		}
	} else {
		semilimitedTable.innerHTML = ""
	}

	if (unlimited.length > 0) {
		populateTable(unlimited, unlimitedTable, crossData, "Unlimited", checked)
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
	for (const list of [newForbidden, newLimited, newSemilimited]) {
		for (const card of list) {
			newList.push(card)
		}
	}

	changes = []

	// Check for changes within the banlist: From 0 to 1 or 2, from 1 to 0 or 2 and from 2 to 0 or 1
	for (const card1 of oldList) {
		for (const card2 of newList) {
			if (card1.id === card2.id) {
				// Check the number of legal copies
				if (card1.copies != card2.copies) {
					// Legal copies have changed: add it to changes
					changes.push({
						id: card1.id,
						name: card1.name,
						oldCopies: card1.copies,
						newCopies: card2.copies
					})
				}
			}
		}
	}
	// Check for removals within the new banlist: From 0, 1 or 2 to 3
	for (const card1 of oldList) {
		var found = false
		for (const card2 of newList) {
			if (card1.id === card2.id) {
				found = true
			}
		}
		if (!found) {
			// Card is no longer on banlist
			changes.push({
				id: card1.id,
				name: card1.name,
				oldCopies: card1.copies,
				newCopies: 3
			})
		}
	}
	// Check for new entries into the banlist: From 3 to 0, 1 or 2
	for (const card1 of newList) {
		var found = false
		for (const card2 of oldList) {
			if (card1.id === card2.id) {
				found = true
			}
		}
		if (!found) {
			changes.push({
				id: card1.id,
				name: card1.name,
				oldCopies: 3,
				newCopies: card1.copies
			})
		}
	}
	return changes
}

const dropdown = document.getElementById('fileDropdown');
const checkbox = document.getElementById('changesCheckbox')

fetch("banlist/index.json")
	.then(response => response.json())
	.then(data => {
		data.forEach(filename => {
			const option = document.createElement('option');
			option.text = new Date(filename.replace('.json', '')).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
			option.value = filename;
			dropdown.add(option);
		})
		loadBanlist(dropdown, checkbox.checked)
	}
);

function loadBanlist(dropdown, checked) {
	dropdown.disabled = true
	checkbox.disabled = true
	const selectedValue = dropdown.value;
	const selectedIndex = dropdown.selectedIndex;
	const prevIndex = selectedIndex + 1 < dropdown.options.length ? selectedIndex + 1 : -1;
	const prevValue = prevIndex >= 0 ? dropdown.options[prevIndex].value : null;

	if (!prevValue) {
		loadData(selectedValue).then(data =>{
			populateTables(data, [], [], checked)
			dropdown.disabled = false
			checkbox.disabled = false
		})
	} else {
		loadCards().then(
			cards => loadData(prevValue).then(
				oldData => loadData(selectedValue).then(newData => {
					const changes = crossData(oldData, newData);
					const newlyUnlimitedNames = changes.filter(card => card.newCopies === 3).map(card => card.name);
					unlimited = convertArrayToNewData(newlyUnlimitedNames, cards, 3)
					populateTables(newData, unlimited, changes, checked);
					dropdown.disabled = false
					checkbox.disabled = false
				})
			)
		)
	}
}

dropdown.addEventListener('change', function () {
	loadBanlist(this, checkbox.checked)
});

checkbox.addEventListener("change", () => {
	loadBanlist(dropdown, checkbox.checked)
});