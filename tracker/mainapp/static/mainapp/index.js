// Define a global object to store filter configurations
const filterConfig = {
    difficulty: null,
    tags: [],
    searchQuery: ''
};

// Global variable to store the loaded questions data
let questionsall = [];

/* when the DOM content of the page has been loaded, 
  we attach event listeners to each of the buttons. 
  
  Ensures use of the function to only run the code once all content has loaded
   
   */
// Wait for the DOM content to load before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {

    // Attach event listeners to buttons
    document.querySelector('#compose').addEventListener('click', composeQuestion);
    document.querySelector('#compose-form').onsubmit = addQuestion;
    document.querySelector('#import').addEventListener('click', importQuestion);
    // document.querySelector('#importall').addEventListener('click', importall);
    document.querySelector('#import-form').onsubmit = importQ;
    document.querySelector('#add-note-form').onsubmit = addNote;
    
    // Load the home view by default
    loadHome();

    // Attach event listener to table rows
    document.querySelector('#allquestions-view').addEventListener('click', function(event) {
        const row = event.target.closest('tr');
        if (row) {
            const number = row.querySelector('td:nth-child(1)').textContent; // Assuming number is in the first column
            loadQuestionDetails(number);
        }
    });

    // Attach event listeners to filters
    document.querySelector('#difficulty-filter').addEventListener('change', event => {
        const selectedDifficulty = event.target.value;
        filterConfig.difficulty = selectedDifficulty;
        updateTable();
    });
    
    document.querySelector('#tags-filter').addEventListener('change', event => {
        const selectedTags = Array.from(event.target.selectedOptions).map(option => option.value);
    
        selectedTags.forEach(tag => {
            if (isTagSelected(tag)) {
                // Tag is already selected, remove it
                const index = filterConfig.tags.indexOf(tag);
                filterConfig.tags.splice(index, 1);
            } else {
                // Tag is not selected, add it
                filterConfig.tags.push(tag);
            }
        });
    
        updateTable();
    });

    document.querySelector('#tags-filter').addEventListener('click', event => {
        const tag = event.target.value;
    
        if (isTagSelected(tag)) {
            // Tag is already selected, remove it
            const index = filterConfig.tags.indexOf(tag);
            filterConfig.tags.splice(index, 1);
        } else {
            // Tag is not selected, add it
            filterConfig.tags.push(tag);
        }
    
        updateTable();
    });

    document.querySelector('#search-input').addEventListener('input', event => {
        const searchQuery = event.target.value.toLowerCase();
        filterConfig.searchQuery = searchQuery;
        updateTable();
    });
    

});

function isTagSelected(tag) {
    return filterConfig.tags.includes(tag);
}

// Apply filters to questions based on filterConfig
function applyFilters(questions) {
    let filteredQuestions = questions;

    if (filterConfig.difficulty) {
        filteredQuestions = filteredQuestions.filter(question => question.difficulty === filterConfig.difficulty);
    }

    if (filterConfig.tags.length > 0) {
        filteredQuestions = filteredQuestions.filter(question => {
            return filterConfig.tags.every(tag => question.tags.includes(tag));
        });
    }

    if (filterConfig.searchQuery) {
        filteredQuestions = filteredQuestions.filter(question => {
            return (
                question.title.toLowerCase().includes(filterConfig.searchQuery) ||
                question.tags.toLowerCase().includes(filterConfig.searchQuery)
            );
        });
    }

    return filteredQuestions;
}

function updateTable() {
    const filteredQuestions = applyFilters(questionsall);
    const table = createQuestionTable(filteredQuestions);

    const questionView = document.querySelector('#allquestions-view');
    const filtersSection = document.querySelector('#filters');
    const searchInput = document.querySelector('#search-input');

    // Clear the table content but keep the filters section
    while (questionView.firstChild) {
        questionView.removeChild(questionView.firstChild);
    }

    questionView.appendChild(filtersSection);

    // Inside the loadHome function or where you're populating the tags dropdown
    const tagsSelect = document.querySelector('#tags-filter');
    const uniqueTags = new Set(questionsall.flatMap(question => question.tags.split(', ')));

    // Clear existing options before repopulating
    tagsSelect.innerHTML = '';

    uniqueTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;

        if (isTagSelected(tag)) {
            option.selected = true; // Mark the option as selected
        }

        tagsSelect.appendChild(option);
    });

    questionView.appendChild(searchInput);
    questionView.appendChild(table);
    document.getElementById("search-input").focus();
    console.log(filterConfig);
}

// ...

// Switches between different views by showing/hiding elements
function switchView(viewId) {
    const views = ['#allquestions-view', '#compose-view', '#question-view', '#import-view'];
    views.forEach(view => {
        if (view === viewId) {
            document.querySelector(view).style.display = 'block';
        } else {
            document.querySelector(view).style.display = 'none';
        }
    });
}

// Loads the default home view
function loadHome() {
    switchView('#allquestions-view');

    fetch('/questions/all')
        .then(response => response.json())
        .then(questions => {
            questionsall = questions;
            const filtersSection = document.querySelector('#filters');
            const table = createQuestionTable(questions);
            const allQuestionsView = document.querySelector('#allquestions-view');
            // Clear and re-append the filters section
            // filtersSection.innerHTML = '';
                // Populate the tags dropdown
            const tagsSelect = document.querySelector('#tags-filter');
            const uniqueTags = new Set(questionsall.flatMap(question => question.tags.split(', ')));
            uniqueTags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                option.textContent = tag;
                tagsSelect.appendChild(option);
            });
            allQuestionsView.appendChild(filtersSection);
            allQuestionsView.appendChild(table);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while loading questions.');
        });
}

// Creates and populates a question table
function createQuestionTable(questions) {
    
    const table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-hover');

    const headerRow = table.insertRow();
    const headers = ['Number', 'Title', 'Difficulty', 'Tags', 'Attempts'];
    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });

    questions.forEach(question => {
        const row = table.insertRow();
        const cells = [question.number, question.title, question.difficulty, question.tags, question.attempts];
        cells.forEach(cellValue => {
            const cell = row.insertCell();
            cell.textContent = cellValue;
        });
    });

    return table;
}

// Clears form fields and removes validation classes
function clearFormFields(fieldIds) {
    fieldIds.forEach(id => {
        const field = document.querySelector(`#${id}`);
        field.value = '';
        field.classList.remove('is-valid', 'is-invalid');
    });
}

// Shows the compose view and clears form fields
function composeQuestion() {
    switchView('#compose-view');
    clearFormFields(['title', 'number', 'description', 'tags', 'url', 'solved-first-time']);
}

function importQuestion() {
    // Show compose view and hide other views
    switchView('#import-view');
    clearFormFields(['number']);
}

function addQuestion() {
    // Get form field values
    const title = document.querySelector('#title').value;
    const number = document.querySelector('#number').value;
    const description = document.querySelector('#description').value;
    const difficultySelect = document.querySelector('#difficulty');
    const difficulty = difficultySelect.options[difficultySelect.selectedIndex].value;
    const tags = document.querySelector('#tags').value;
    const url = document.querySelector('#url').value;
    const solvedFirstTimeCheckbox = document.querySelector('#solved-first-time');
    const solvedFirstTime = solvedFirstTimeCheckbox.checked;

    // Send post request to upload a new question
    fetch('/questions/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
            number: number,
            description: description,
            difficulty: difficulty,  // Use the selected difficulty value
            tags: tags,
            url: url,
            solvedfirst: solvedFirstTime
        })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        alert(JSON.stringify(result));
        clearFormFields(['title', 'number', 'description', 'tags', 'url', 'solved-first-time']);

    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while creating the question.');
    });

    return false;
}

function addNote(questionNumber, content) {
    console.log('noting')
    fetch('/questions/createnote', {  // Make sure the URL path is correct
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question_number: questionNumber,
            content: content,
        })
    })
    .then(response => response.json())
    .then(result => {
        // Print result

        // Add the new note to the notes list
        const notesList = document.getElementById('notes-list');
        const newNoteItem = document.createElement('li');
        newNoteItem.textContent = content;
        notesList.appendChild(newNoteItem);

        // Clear the note content input
        document.querySelector('#note-content').value = '';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while adding the note.');
    });
}

function importQ(){
    const number = document.querySelector('#import-number').value;
    const note = document.querySelector('#note').value;

    // Fetch request to check if the question exists and retrieve data
    fetch(`/questions/import?number=${number}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Process the retrieved data, e.g., update UI with the information
            // Update UI with the fetched data
            const confirmMessage = `Do you want to add the question "${data.title}" (${data.difficulty}) to the database?`;
            if (confirm(confirmMessage)) {
                // User confirmed, proceed to add question to the database
                addNote(data.frontendQuestionId, note)
                addQuestionToDatabase(data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while importing the question.');
        });

    return false;
}

function importall(){
   const problems = [1768, 389, 28, 459, 283, 66, 1822, 1502, 896, 13, 58, 709, 88, 27, 26, 121, 14, 125, 392, 1071, 1431, 605, 354, 643, 724, 350, 682, 657, 1275, 1041, 1672, 1672, 1572, 54, 73, 104, 100, 226, 101, 112, 637, 108, 872, 700, 94, 543, 530, 35, 374, 136, 68, 1523, 1491, 860, 976, 1232, 67, 228, 9, 171, 326, 21, 206, 141, 160, 234, 20, 933, 242, 383, 1, 205, 290, 202, 219, 2215, 1207, 169, 217, 387]
   problems.forEach(import_all)
}

function import_all(value) {
    const number = value;

    // Fetch request to check if the question exists and retrieve data
    fetch(`/questions/import?number=${number}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            addQuestionToDatabase(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while importing the question.');
        });

    return false;
  }

function addQuestionToDatabase(questionData) {
    // Send post request to add the question to the database
    fetch('/questions/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: questionData.title,
            number: questionData.frontendQuestionId,
            description: '',  // You can provide a default description or leave it empty
            difficulty: questionData.difficulty.toLowerCase(),  // Convert to lowercase
            tags: questionData.topicTags.map(tag => tag.name).join(', '),
            url: `https://leetcode.com/problems/${questionData.titleSlug}`,
            solvedfirst: false  // Assuming the user hasn't solved it first time
        })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        alert(JSON.stringify(result));
        clearFormFields(['number']);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while adding the question to the database.');
    });
}

function loadQuestionDetails(number) {
    switchView('#question-view');

    // Fetch request to get question details by number
    fetch(`/questions/getquestion?number=${number}`)
    .then(response => response.json())
    .then(question => {
        // Update the question-view with question details
        const questionView = document.querySelector('#question-view');
        questionView.innerHTML = `
            <!-- Display question details ... -->
            <h3>${question.title}</h3>
            <p>Number: ${question.number}</p>
            <p>Difficulty: ${question.difficulty}</p>
            <p>Description: ${question.description}</p>
            <p>Tags: ${question.tags}</p>
            <p>URL: <a href="${question.url}" target="_blank">${question.url}</a></p>
            <p>Solved First Time: ${question.solved_first_time ? 'Yes' : 'No'}</p>

            <!-- Notes section -->
            <div id="notes-section">
                <h4>Notes:</h4>
                <ul id="notes-list"></ul>
                <form id="add-note-form">
                    <input type="text" id="note-content" placeholder="Add a note...">
                    <button type="submit">Add Note</button>
                </form>
            </div>
        `;

        // Fetch notes for the question
        fetch(`/questions/getnotes?question_number=${question.number}`)
        .then(response => response.json())
        .then(notes => {
            // Display notes in the notes section
            const notesList = document.getElementById('notes-list');
            notes.forEach(note => {  // This is where the error occurs
                const listItem = document.createElement('li');
                listItem.textContent = note.content;
                notesList.appendChild(listItem);
            });
    
            // Add event listener to the note submission form
            const addNoteForm = document.querySelector('#add-note-form');
            addNoteForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const noteContent = document.querySelector('#note-content').value;
                if (noteContent.trim() !== '') {
                    addNote(question.number, noteContent);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching notes:', error);
        });
    
    })
    .catch(error => {
        console.error('Error fetching question details:', error);
        alert('An error occurred while loading question details.');
    });
}
