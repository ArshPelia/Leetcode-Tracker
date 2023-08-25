/* when the DOM content of the page has been loaded, 
  we attach event listeners to each of the buttons. 
  
  Ensures use of the function to only run the code once all content has loaded
   
   */
// Wait for the DOM content to load before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {

    // Attach event listeners to buttons
    document.querySelector('#myquestions').addEventListener('click', loadMyQuestions);
    document.querySelector('#compose').addEventListener('click', composeQuestion);
    document.querySelector('#compose-form').onsubmit = addQuestion;
    document.querySelector('#import').addEventListener('click', importQuestion);
    document.querySelector('#import-form').onsubmit = importQ;
    
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
});

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
            const table = createQuestionTable(questions);
            const allQuestionsView = document.querySelector('#allquestions-view');
            allQuestionsView.innerHTML = '<h3>All Questions</h3>';
            allQuestionsView.appendChild(table);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while loading questions.');
        });
}

// Loads the user's questions
function loadMyQuestions() {
    switchView('#allquestions-view');

    fetch('/questions/myquestions')
        .then(response => response.json())
        .then(questions => {
            const table = createQuestionTable(questions);
            const allQuestionsView = document.querySelector('#allquestions-view');
            allQuestionsView.innerHTML = '<h3>My Questions</h3>';
            allQuestionsView.appendChild(table);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while loading your questions.');
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

    console.log(difficulty)

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
        console.log(result);
        alert(JSON.stringify(result));
        clearFormFields(['title', 'number', 'description', 'tags', 'url', 'solved-first-time']);

    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while creating the question.');
    });

    return false;
}

function importQ(){
    const number = document.querySelector('#import-number').value;

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
                addQuestionToDatabase(data);
            }
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
        console.log(result);
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
                <h3>${question.title}</h3>
                <p>Number: ${question.number}</p>
                <p>Difficulty: ${question.difficulty}</p>
                <p>Description: ${question.description}</p>
                <p>Tags: ${question.tags}</p>
                <p>URL: <a href="${question.url}" target="_blank">${question.url}</a></p>
                <p>Solved First Time: ${question.solved_first_time ? 'Yes' : 'No'}</p>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while loading question details.');
        });
}

