// Global variables to store data and state
let materials = [] // Array to store all recycling materials
let filteredCategories = [] // Array to store filtered categories based on search
let categoryId = 0 // Counter for assigning unique IDs to categories
let acceptedItems = [] // Array to store all accepted items
let nonAcceptedItems = [] // Array to store all non-accepted items
let manageTagsOpen = false // Flag to track if tag management view is open
let types = [] // Array to store all material types

// Initialize the application when the window loads
// DONE BY ROMAN
window.onload = () => {
  // Fetch data from JSON file
  let url = `recycling.json` // Name of the JSON file

  fetch(url)
    .then((response) => response.json())
    .then((jsonData) => {
      materials = [...jsonData.materials]

      // Assign bin colors to materials (temporary)
      materials[0].binColour = "Green"
      materials[1].binColour = "Black"
      materials[2].binColour = "Green"
      materials[3].binColour = "Green"
      materials[4].binColour = "Brown"

      // Assign unique IDs to each category and copy bin colors to category level
      materials.forEach((material) => {
        material.categories.forEach((category) => {
          category.imageUrls = [] // Initialize image URLs array
          category.id = categoryId++ // Assign a unique ID to each category
          category.recycling_id = category.recycling_code // Add recycling_id property
          category.binColour = material.binColour // Copy bin color from material to category
        })
      })

      // Display the table with all materials initially
      console.log("Materials", materials)
      displayTable(materials)
      displayAcceptedItems()
    })
}

// Display the table with filtered or all categories
//done by roman
function displayTable(filteredCategories) {
  console.log("Filter", filteredCategories)

  // Show filters and reset tag management state
  document.getElementById("filters").style.display = "flex"
  manageTagsOpen = false

  // Reset item arrays
  acceptedItems = []
  nonAcceptedItems = []
  
  // Start building the HTML table
  let htmlString = `
    <table border="2" style="text-align: center;">
      <tr>
        <th>Name</th>        
        <th>Type</th>
        <th>Accepted Items</th>
        <th>Non-Accepted Items</th>
        <th>Bin Colour</th>
        <th>Actions</th>
      </tr>`

  // Loop through each material and its categories
  filteredCategories.forEach((material) => {
    material.categories.forEach((category) => {
      // Collect items for dropdown filters
      acceptedItems.push(category.accepted_items)
      nonAcceptedItems.push(category.non_accepted_items)
      types.push(material.type)

      // Build options for accepted items dropdown
      let acceptedItemsOptions = ""
      category.accepted_items.forEach((item) => {
        acceptedItemsOptions += `<option>${item}</option>`
      })

      // Build options for non-accepted items dropdown
      let nonAcceptedItemsOptions = ""
      category.non_accepted_items.forEach((item) => {
        nonAcceptedItemsOptions += `<option>${item}</option>`
      })
      
      console.log(category.name)
      
      // Add the table row for this category
      htmlString += `
      
        <tr id="${category.recycling_id}">
          <td>${category.name}</td>
          <td>${material.type}</td>

          <td>
            <select>
              ${acceptedItemsOptions}
            </select>
          </td>
          <td>
            <select>
              ${nonAcceptedItemsOptions}
            </select>
          </td>
          <td>${material.binColour}</td>
          <td>
            <input type="button" onclick="displayView('${category.recycling_id}')" id="viewRow" value="View">
            <input type="button" onclick="displayEdit('${category.recycling_id}')" id="edit" value="Edit">
            <input type="button" onclick="deleteRow('${category.recycling_id}')" id="delete" value="Delete">
          </td>
        </tr>`
    })
  })

  // Close the table and update the display
  htmlString += `</table>`
  document.getElementById("display").innerHTML = htmlString
}

// Search for materials based on user input
// DONE BY ROMAN
function searchSort() {
  // Get search value and convert to lowercase for case-insensitive comparison
  let searchValue = document.getElementById("search").value.toLowerCase()

  // Clear the filteredCategories array before each search
  filteredCategories = []

  // If the search input is empty, display all materials
  if (searchValue === "") {
    displayTable(materials)
    return // Exit function early if no search term
  }

  // Filter materials based on search value
  materials.forEach((material) => {
    // Find categories that match the search term
    let matchingCategories = material.categories.filter((category) =>
      category.name.toLowerCase().includes(searchValue)
    )
    
    // If there are matching categories, add them to filtered results
    if (matchingCategories.length > 0) {
      // Push the material with only the matching categories
      filteredCategories.push({
        ...material,
        categories: matchingCategories,
      })
    }
  })

  // Display the filtered categories in the table
  displayTable(filteredCategories)
}




// Filter materials based on dropdown selection
// DONE BY ROMAN
function filterByDropdown() {
  // Get the selected value from the dropdown
  let dropdownValue = document.getElementById("itemDropdown").value

  // Clear the filteredCategories array before each filter
  filteredCategories = []

  // If no item is selected in the dropdown, display all materials
  if (dropdownValue === "") {
    displayTable(materials)
    return
  }

  // Filter materials based on the selected dropdown item
  materials.forEach((material) => {
    let matchingCategories = []

    // Check each category to see if it contains the selected item
    material.categories.forEach((category) => {
      if (category.accepted_items.includes(dropdownValue)) {
        matchingCategories.push(category)
      }
    })

    // If there are matching categories, add them to filtered results
    if (matchingCategories.length > 0) {
      // Push the material with only the matching categories
      filteredCategories.push({
        ...material,
        categories: matchingCategories,
      })
    }
  })

  // Display the filtered categories in the table
  displayTable(filteredCategories)
}

// Wrapper function to display the add item form
function JavascriptDisplayAddItem() {
  categoryId++
  displayAddItem(categoryId)
}


function displayAcceptedItems() {
  // Start building the dropdown HTML
  let htmlString = `<select id="itemDropdown" onchange="filterByDropdown()">`
  
  // Get unique items from all accepted items
  let uniqueItems = [...new Set(acceptedItems.flat())]

  htmlString += `<option value="">Select an item</option>`

  // Add each unique item as an option
  uniqueItems.forEach((item) => {
    htmlString += `<option value="${item}">${item}</option>`
  })

  htmlString += `</select>`
  document.getElementById("dropdown").innerHTML = htmlString
}


// Display the form to add a new item
// DONE BY ROMAN
function displayAddItem() {
  // Hide the filters section
  document.getElementById("filters").style.display = "none"

  // If tag management is open, show the add tag form instead
  if (manageTagsOpen) {
    displayAddTag()
    return
  }

  // Get unique items for dropdowns
  let uniqueAcceptedItems = [...new Set(acceptedItems.flat())] // Flatten and deduplicate arrays
  let uniqueNonAcceptedItems = [...new Set(nonAcceptedItems.flat())]
  let uniqueTypes = [...new Set(types.flat())]

  // Build options for accepted items dropdown
  let acceptedItemsOptions = ""
  uniqueAcceptedItems.forEach((item) => {
    acceptedItemsOptions += `<option value="${item}">${item}</option>`
  })

  // Build options for non-accepted items dropdown
  let nonAcceptedItemsOptions = ""
  uniqueNonAcceptedItems.forEach((item) => {
    nonAcceptedItemsOptions += `<option value="${item}">${item}</option>`
  })

  // Build options for types dropdown
  let typesOptions = ""
  uniqueTypes.forEach((item) => {
    typesOptions += `<option value="${item}">${item}</option>`
  })

  // Create the form HTML
  let htmlString = `
    <div id="edit">
      <legend>Add New Item</legend>
      <input type="text" id="addName" placeholder="Name" required><br>

      <h4>Type:</h4>
      <select id="addType" required>
        ${typesOptions}
      </select><br>

      <input type="text" id="addRecyclingProcess" placeholder="Recycling Process" required><br>

      <h4>Accepted Items:</h4>
      <select id="addAcceptedItems" multiple>
        ${acceptedItemsOptions}
      </select><br>

      <h4>Non-Accepted Items:</h4>
      <select id="addNonAcceptedItems" multiple>
        ${nonAcceptedItemsOptions}
      </select><br>

      <input type="text" id="addRecyclability" placeholder="Recyclability" required><br>
      <input type="text" id="addEnvironmentalImpact" placeholder="Environmental Impact" required><br>
      <input type="text" id="addBinColour" placeholder="Bin Colour" required><br>
    <h4>Image URLs:</h4>
      <input type="text" id="addImageUrls" placeholder="Enter image URLs separated by commas"><br>
      <input type="button" id="addTag" value="Submit" onclick="addMaterial()">
    </div>`
    
  // Update the display with the form
  document.getElementById("display").innerHTML = htmlString
}



// Create and add a new material to the database
// DONE BY ROMAN
function addMaterial() {
  // Get values from form fields
  let name = document.getElementById("addName").value
  let type = document.getElementById("addType").value
  let recyclingProcess = document.getElementById("addRecyclingProcess").value

  // Get selected accepted items
  let acceptedItemsSelect = []
  document.querySelectorAll("#addAcceptedItems option:checked").forEach((option) => {
    acceptedItemsSelect.push(option.value)
  })

  // Get selected non-accepted items
  let nonAcceptedItemsSelect = []
  document.querySelectorAll("#addNonAcceptedItems option:checked").forEach((option) => {
    nonAcceptedItemsSelect.push(option.value)
  })

  // Get remaining form values
  let recyclability = document.getElementById("addRecyclability").value
  let environmentalImpact = document.getElementById(
    "addEnvironmentalImpact"
  ).value
  let binColour = document.getElementById("addBinColour").value
  let imageUrls = document.getElementById("addImageUrls").value.split(',')
 
  // Validate required fields
  if (!name || !type || !recyclingProcess || !recyclability || !environmentalImpact || !binColour) {
    alert("Please fill out all required fields")
    return
  }

  // Create new material object
  let newMaterial = {
    type: type,
    categories: [
      {
        id: categoryId++,
        name: name,
        recycling_id: `C${categoryId}`,
        recycling_process: recyclingProcess,
        accepted_items: acceptedItemsSelect,
        non_accepted_items: nonAcceptedItemsSelect,
        recyclability: recyclability,
        environmental_impact: environmentalImpact,
        binColour: binColour,
        imageUrls: imageUrls,
      },
    ],
  }

  // Add the new material to the materials array
  materials.push(newMaterial)

  // Update displays
  displayTable(materials)
  displayAcceptedItems()
}




// Display detailed view of a selected category
// DONE BY ROMAN
function displayView(categoryID) {
  // Hide the filters section
  document.getElementById("filters").style.display = "none"

  // Find the category to display
  let categoryToDisplay
  materials.forEach((material) => {
    material.categories.forEach((category) => {
      if (category.recycling_id === categoryID) {
        categoryToDisplay = category
      }
    })
  })

  // Create the view HTML
  let htmlString = `
    <div id="viewRow" readonly>
      <h3>Material Details</h3><br>
      <h4><br>Name: </h4><textarea readonly>${categoryToDisplay.name}</textarea>
      <h4><br>Recycling Process: </h4><textarea readonly>${
        categoryToDisplay.recycling_process
      }</textarea>
      <h4><br>Accepted Items: </h4><textarea readonly>${categoryToDisplay.accepted_items.join(
        ", "
      )}</textarea>
      <h4><br>Non-Accepted Items: </h4><textarea readonly>${categoryToDisplay.non_accepted_items.join(
        ", "
      )}</textarea>
      <h4><br>Recyclability: </h4><textarea readonly>${
        categoryToDisplay.recyclability
      }</textarea>
      <h4><br>Environmental Impact: </h4><textarea readonly>${
        categoryToDisplay.environmental_impact
      }</textarea>
      <h4><br>Bin Colour: </h4><textarea readonly>${
        categoryToDisplay.binColour
      }</textarea>
       <h4><br>Image URLs: </h4><textarea readonly>${categoryToDisplay.imageUrls.join(", ")}</textarea>
      <br><br><button id="viewTag" onclick="displayTable(materials)">Close</button>
    </div>`
    
  // Update the display with the view
  document.getElementById("display").innerHTML = htmlString
}

// Display the edit form for a selected category
// DONE BY ROMAN
function displayEdit(categoryID) {
  // Hide the filters section
  document.getElementById("filters").style.display = "none"

  // Find the category to edit
  let categoryToDisplay
  materials.forEach((material) => {
    material.categories.forEach((category) => {
      if (category.recycling_id === categoryID) {
        categoryToDisplay = category
      }
    })
  })

  // Get unique items for dropdowns
  let uniqueAcceptedItems = [...new Set(acceptedItems.flat())]
  let uniqueNonAcceptedItems = [...new Set(nonAcceptedItems.flat())]
  let uniqueTypes = [...new Set(types.flat())]
  console.log(uniqueTypes)

  // Build options for accepted items dropdown
  let acceptedItemsOptions = ""
  uniqueAcceptedItems.forEach((item) => {
    acceptedItemsOptions += `<option value="${item}">${item}</option>`
  })

  // Build options for non-accepted items dropdown
  let nonAcceptedItemsOptions = ""
  uniqueNonAcceptedItems.forEach((item) => {
    nonAcceptedItemsOptions += `<option value="${item}">${item}</option>`
  })

  // Build options for types dropdown
  let typesOptions = ""
  uniqueTypes.forEach((item) => {
    typesOptions += `<option value="${item}">${item}</option>`
  })

  // Create the edit form HTML
  let htmlString = `
    <div id="edit">
      <h3>Edit Material Details</h3><br>
      <h4><br>Name: </h4><textarea id="editName">${
        categoryToDisplay.name
      }</textarea>
      <h4><br>Type: </h4>
      <select id="editType">
        ${typesOptions}
      </select><br>
      <h4><br>Recycling Process: </h4><textarea id="editRecyclingProcess">${
        categoryToDisplay.recycling_process
      }</textarea>
      <h4><br>Accepted Items: </h4><textarea readonly id="editAcceptedItems">${categoryToDisplay.accepted_items.join(
        ", "
      )}</textarea>
      <h4><br>Select New Accepted Items: </h4>
      <select id="editAcceptedItems" multiple>
        ${acceptedItemsOptions}
      </select><br>
      <h4><br>Non-Accepted Items: </h4><textarea readonly id="editNonAcceptedItems">${categoryToDisplay.non_accepted_items.join(
        ", "
      )}</textarea>
      <h4><br>Select New Non-Accepted Items: </h4>
      <select id="editNonAcceptedItems" multiple>
        ${nonAcceptedItemsOptions}
      </select><br>
      <h4><br>Recyclability: </h4><textarea id="editRecyclability">${
        categoryToDisplay.recyclability
      }</textarea>
      <h4><br>Environmental Impact: </h4><textarea id="editEnvironmentalImpact">${
        categoryToDisplay.environmental_impact
      }</textarea>
      <h4><br>Bin Colour: </h4><textarea id="editBinColour">${
        categoryToDisplay.binColour
      }</textarea>
       <h4><br>Image URLs: </h4><textarea id="editImageUrls">${categoryToDisplay.imageUrls.join(", ")}</textarea>
      <br><br><button id="addTag" onclick="saveEditedMaterial('${categoryID}')">Save</button>
     <br>
      <button id="addTag" onclick="displayTable(materials)">Cancel</button>
    </div>`
   
  // Update the display with the edit form
  document.getElementById("display").innerHTML = htmlString
}


// Display the tag management interface
// DONE BY ROMAN
function manageTags() {
  // Hide the filters section
  document.getElementById("filters").style.display = "none"

  // Set the tag management flag
  manageTagsOpen = true

  // Collect all current accepted items from all categories
  let allAcceptedItems = []
  materials.forEach((material) => {
    material.categories.forEach((category) => {
      allAcceptedItems = allAcceptedItems.concat(category.accepted_items) // Combine arrays
    })
  })

  // Get unique items from the collected items
  let uniqueItems = [...new Set(allAcceptedItems)]

  // Create the tag management HTML
  let htmlString = `
    <div>
      <h3>Tag Management</h3>
      <table border="1" style="margin-top: 20px;">
        <tr>
          <th>Tag Name</th>
          <th>Actions</th>
        </tr>`

  // Add each unique tag to the table
  uniqueItems.forEach((item) => {
    htmlString += `
      <tr>
        <td>${item}</td>
        <td>
          <button id="edit" onclick="displayEditItem('${item}')">Edit</button>
          <button id="delete" onclick="deleteRowTag('${item}')">Delete</button>
        </td>
      </tr>`
  })

  // Close the table and update the display
  htmlString += `
      </table>
    </div>`

  document.getElementById("display").innerHTML = htmlString
}








// ROMANS AREA

// --------------------------------------------------------------------------------------------------------------------------------------------

// DANIELS AREA


// Variables for sorting
let sortAscendingOrder = true // Track if sorting is ascending (true) or descending (false)
let lastSortColumnName = "" // Track which column was last sorted


// Sort the table based on the specified key
function sort(key) {
  // Toggle sort order if clicking the same column again
  if (lastSortColumnName === key) {
    sortAscendingOrder = !sortAscendingOrder // Reverse the sort order
  } else {
    lastSortColumnName = key // Setting the new sort column
    sortAscendingOrder = true // Change to ascending order
  }


  // Collect all categories for sorting
  let allCategories = []
  materials.forEach((material) => {
    material.categories.forEach((category) => {
      allCategories.push({ ...category, type: material.type }) // Include material type for sorting
    })
  })

  // Sort the categories based on the selected key
  allCategories.sort((a, b) => {
    let valueA, valueB

    // Get the appropriate values based on the key
    if (key === "name" || key === "binColour" || key === "type") {
      valueA = a[key].toLowerCase()
      valueB = b[key].toLowerCase()
    } else if (key === "accepted_items" || key === "non_accepted_items") {
      valueA = a[key].join(", ").toLowerCase()
      valueB = b[key].join(", ").toLowerCase()
    }

    // Sort in ascending or descending order
    if (sortAscendingOrder) {
      return valueA.localeCompare(valueB) // Alphabetical order
    } else {
      return valueB.localeCompare(valueA) // Reverse alphabetical order
    }
  })

  // Rebuild the materials structure with sorted categories
  let sortedMaterials = []
  let currentMaterial = null

  allCategories.forEach((category) => {
    if (!currentMaterial || currentMaterial.type !== category.type) {
      // Create a new material entry when type changes
      currentMaterial = {
        type: category.type,
        binColour: category.binColour, 
        categories: [],
      }
      sortedMaterials.push(currentMaterial)
    }
    currentMaterial.categories.push(category)
  })

  // Display the sorted table
  if (filteredCategories.length > 0) {
    displayTable(filteredCategories) // Show filtered categories if search is active
  } else {
    displayTable(sortedMaterials) // Show all materials if no search is active
  }
}

// Enhanced displayTable function with sorting indicators
function displayTable(filteredCategories) {
  // Show filters and reset tag management state
  document.getElementById("filters").style.display = "flex"
  manageTagsOpen = false

  // Reset item arrays
  acceptedItems = []
  nonAcceptedItems = []
  
  // Start building HTML table with sortable headers
  let htmlString = `
  
    <table border="2" style="text-align: center;">
    <tr>
        <th onclick="sort('name')">Name ${lastSortColumnName === 'name' ? (sortAscendingOrder ? '▲' : '▼') : ''}</th>
        <th onclick="sort('type')">Type ${lastSortColumnName === 'type' ? (sortAscendingOrder ? '▲' : '▼') : ''}</th>
        <th onclick="sort('accepted_items')">Accepted Items ${lastSortColumnName === 'accepted_items' ? (sortAscendingOrder ? '▲' : '▼') : ''}</th>
        <th onclick="sort('non_accepted_items')">Non-Accepted Items ${lastSortColumnName === 'non_accepted_items' ? (sortAscendingOrder ? '▲' : '▼') : ''}</th>
        <th onclick="sort('binColour')">Bin Colour ${lastSortColumnName === 'binColour' ? (sortAscendingOrder ? '▲' : '▼') : ''}</th>
        <th>Actions</th>
      </tr>`

  // Loop through each material and its categories
  filteredCategories.forEach((material) => {
    material.categories.forEach((category) => {
      // Collect items for dropdown filters
      acceptedItems.push(category.accepted_items)
      nonAcceptedItems.push(category.non_accepted_items)
      types.push(material.type)

      // Build the choices for accepted items dropdown
      let acceptedItemsOptions = ""
      category.accepted_items.forEach((item) => {
        acceptedItemsOptions += `<option>${item}</option>`
      })

      // Build choices for non-accepted items dropdown
      let nonAcceptedItemsOptions = ""
      category.non_accepted_items.forEach((item) => {
        nonAcceptedItemsOptions += `<option>${item}</option>`
      })

      // Add the table row for this category
      htmlString += `
        <tr id="${category.recycling_id}">
          <td>${category.name}</td>
          <td>${material.type}</td>
          <td>
            <select>
              ${acceptedItemsOptions}
            </select>
          </td>
          <td>
            <select>
              ${nonAcceptedItemsOptions}
            </select>
          </td>
          <td>${category.binColour}</td>
          <td>
            <input type="button" onclick="displayView('${category.recycling_id}')" id="viewRow" value="View">
            <input type="button" onclick="displayEdit('${category.recycling_id}')" id="edit" value="Edit">
            <input type="button" onclick="deleteRow('${category.recycling_id}')" id="delete" value="Delete">
          </td>
        </tr>`
    })
  })

  // Close the table and update the display
  htmlString += `</table>`
  document.getElementById("display").innerHTML = htmlString
}








// --------------------------------------------------------------------------------------------------------------------------------------------
// DENIS'S AREA



// Save changes to an edited tag
// DONE BY Denis
function saveEditedItem(oldItemName) {
  // Get the new tag name from the form
  const newTagName = document.getElementById("editTagName").value.trim()

  // Validate the input
  if (!newTagName) {
    alert("Please enter a tag name")
    return
  }

  // Find and update the tag in all categories
  let updated = false
  materials.forEach((material) => {
    material.categories.forEach((category) => {
      // Update in accepted_items array
      const index = category.accepted_items.indexOf(oldItemName)
      if (index !== -1) {
        category.accepted_items[index] = newTagName
        updated = true
      }
    })
  })

  if (updated) {
    // Save to localStorage for persistence
    localStorage.setItem("materials", JSON.stringify(materials)) 
    // Return to the tag management view
    manageTags()
  } 
}




// Save changes to an edited material
// DONE BY DENIS 
function saveEditedMaterial(categoryID) {
  // Get values from form fields
  let name = document.getElementById("editName").value
  let type = document.getElementById("editType").value
  let recyclingProcess = document.getElementById("editRecyclingProcess").value
  
  // Get selected accepted items
  let acceptedItems = []
  document
    .querySelectorAll("#editAcceptedItems option:checked")
    .forEach((option) => {
      acceptedItems.push(option.value)
    })

  // Get selected non-accepted items
  let nonAcceptedItems = []
  document
    .querySelectorAll("#editNonAcceptedItems option:checked")
    .forEach((option) => {
      nonAcceptedItems.push(option.value)
    })

  // Get remaining form values
  let recyclability = document.getElementById("editRecyclability").value
  let environmentalImpact = document.getElementById(
    "editEnvironmentalImpact"
  ).value
  let binColour = document.getElementById("editBinColour").value
  let imageUrls = document.getElementById("editImageUrls").value.split(',')
  
  // Validate required fields
  if (!name || !type || !recyclingProcess || !recyclability || !environmentalImpact || !binColour) {
    alert("Please fill out all required fields")
    return
  }

  // Find and update the category
  materials.forEach((material) => {
    material.categories.forEach((category) => {
      if (category.recycling_id === categoryID) {
        // Update all properties
        category.name = name
        material.type = type
        category.recycling_process = recyclingProcess
        category.accepted_items = acceptedItems
        category.non_accepted_items = nonAcceptedItems
        category.recyclability = recyclability
        category.environmental_impact = environmentalImpact
        category.binColour = binColour
        category.imageUrls = imageUrls
      }
    })
  })

  displayTable(materials)
}


// Show delete confirmation dialog for a category
function deleteRow(id) {
  console.log("Delete requested for id:", id)
  
  // Show confirmation modal
  let htmlString = `
  <div id="delete" class="modal">
    <div class="modal-content">
      <h3>Confirm Deletion</h3>
      <p>Are you sure you want to delete the tag</p>
      <div class="modal-buttons">
        <button id="deleteTag"onclick="deleteRowConfirm('${id}')">Delete</button>
        <br><button id="deleteTag" onclick="manageTags()">Cancel</button>
      </div>
    </div>
  </div>`
  
  // Update the display with the confirmation dialog
  document.getElementById("display").innerHTML = htmlString
}


// Delete a category after confirmation
// DONE BY DENIS
function deleteRowConfirm(id) {
    // Remove the category from materials
    materials.forEach((material, mIndex) => {
      // Filter out the category with the matching ID
      material.categories = material.categories.filter(
        (category) => category.recycling_id !== id
      )
      // If material has no more categories, remove it
      if (material.categories.length === 0) {
        materials.splice(mIndex, 1)
      }
    })
    
    displayTable(materials)
}




// Show delete confirmation dialog for a tag
function deleteRowTag(tag) {
  console.log("Delete requested for tag:", tag)
  
  // Show confirmation modal
  let htmlString = `
  <div id="delete" class="modal">
    <div class="modal-content">
      <h3>Confirm Deletion</h3>
      <p>Are you sure you want to delete the tag "${tag}"?</p>
      <div class="modal-buttons">
        <button id="deleteTag"onclick="confirmDeleteTag('${tag}')">Delete</button>
      <br>  <button id="deleteTag" onclick="manageTags()">Cancel</button>
      </div>
    </div>
  </div>`
  
  // Update the display with the confirmation dialog
  document.getElementById("display").innerHTML = htmlString
}



// Delete a tag after confirmation
function confirmDeleteTag(tag) {
  console.log("Confirming deletion for tag:", tag)
  
  // Trim the tag name
  const tagToDelete = tag.trim()
  
  // Remove the tag from all categories
  materials.forEach((material) => {
    material.categories.forEach((category) => {
      category.accepted_items = category.accepted_items.filter(
        (item) => item.trim() !== tagToDelete
      )
    })
  })

  console.log("Tag deleted, materials updated:", materials)

  // Update the global acceptedItems array to match the current state
  acceptedItems = []
  materials.forEach((material) => {
    material.categories.forEach((category) => {
      acceptedItems.push(category.accepted_items)
    })
  })
  
  // Save to localStorage for persistence
  localStorage.setItem("materials", JSON.stringify(materials))
  
  manageTags()
}


// Display the edit form for a tag
// DONE BY DENIS
function displayEditItem(itemName) {
  // Hide the filters section
  document.getElementById("filters").style.display = "none"

  // Create the edit tag form HTML
  let htmlString = `
    <div id="edit">
      <h3>Edit Tag</h3>
      <p>Editing tag: ${itemName}</p>
      
      <h4>New Tag Name:</h4>
      <input type="text" id="editTagName" value="${itemName}" class="form-control">
      
      <br><br>
      <button id="addTag" onclick="saveEditedItem('${itemName}')">Save Tag</button>
      <br><button id="addTag" onclick="manageTags()">Cancel</button>
    </div>`

  document.getElementById("display").innerHTML = htmlString
}




// Add a new tag to the system
// DONE BY DENIS
function addTag() {
  // Get the new tag name from input
  let newTag = document.getElementById("newTag").value.trim()
  
  // Validate the tag
  if (!newTag) {
    alert("Please enter a tag name")
    return
  }

  // Add the new tag to all relevant categories
  materials.forEach((material) => {
    material.categories.forEach((category) => {
      // Only add if it doesn't already exist
      if (!category.accepted_items.includes(newTag)) {
        category.accepted_items.push(newTag)
      }
    })
  })

  manageTags()
  displayAcceptedItems()
}



// Display the form to add a new tag
// DONE BY DENIS
function displayAddTag() {
  // Create the add tag form HTML
  let htmlString = `
<div id="edit">
      <h3>Add Tag</h3>

   <input type="text" id="newTag" placeholder="Enter new tag">
    <button id="addTag"onclick="addTag()">Add</button>
  
</div>`
  document.getElementById("display").innerHTML = htmlString
}


// Save the edited tag to the category
// DONE BY DENIS
function saveEditedTag(categoryID) {
  // Get the tag name from input
  const tagName = document.getElementById("editTagName").value.trim()

  // Validate the input
  if (!tagName) {
    alert("Please enter a tag name")
    return
  }

  // Find and update the category
  let updated = false
  materials.forEach((material) => {
    material.categories.forEach((category) => {
      if (category.recycling_id === categoryID) {
        category.tag = tagName
        updated = true
      }
    })
  })

  // Refresh the table display
  displayTable(materials)
}


// Display the form to edit a tag for a specific category
// DONE BY DENIS
function displayEditTag(categoryID) {
  // Hide the filters section
  document.getElementById("filters").style.display = "none"

  // Find the category to edit
  let categoryToDisplay
  materials.forEach((material) => {
    material.categories.forEach((category) => {
      if (category.recycling_id === categoryID) {
        categoryToDisplay = category
      }
    })
  })

  // Create the edit tag form HTML
  let htmlString = `
    <div id="edit">
      <h3>Edit Tag</h3>
      <p>Editing tag for category: ${categoryToDisplay.name}</p>
      
      <h4>Tag Name:</h4>
      <input type="text" id="editTagName" value="${categoryToDisplay.tag}" class="form-control">
      
      <br><br>
      <button onclick="saveEditedTag('${categoryID}')">Save Tag</button>
      <button onclick="displayTable(materials)">Cancel</button>
    </div>`

  // Update the display with the edit form
  document.getElementById("display").innerHTML = htmlString
}


