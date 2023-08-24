/* when the DOM content of the page has been loaded, 
  we attach event listeners to each of the buttons. 
  
  Ensures use of the function to only run the code once all content has loaded
   
   */
document.addEventListener('DOMContentLoaded', function() {

// Use buttons to toggle between views
// document.querySelector('form').onsubmit = () => send_mail();
    document.querySelector('#compose').addEventListener('click', () => compose_question());
    // Add an event listener for the "My Questions" button
    document.querySelector('#myquestions').addEventListener('click', () => loadMyQuestions());
    document.querySelector('form').onsubmit = () => addQ();

    // By default, load the home
    load_home();
});

function load_home() {
    // Show the mailbox and hide other views
    document.querySelector('#allquestions-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#question-view').style.display = 'none';

    // Fetch all questions from the backend
    fetch('/questions/all')
        .then(response => response.json())
        .then(questions => {
            // Create and populate the table
            const table = createQuestionTable(questions);

            // Replace the content of the allquestions-view with the table
            const allQuestionsView = document.querySelector('#allquestions-view');
            allQuestionsView.innerHTML = '';
            document.querySelector('#allquestions-view').innerHTML = `<h3>All Questions</h3>`;
            allQuestionsView.appendChild(table);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while loading questions.');
        });
}
function compose_question() {
    // Show compose view and hide other views
    document.querySelector('#allquestions-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    clearFormFields(['title', 'number', 'description', 'tags', 'url', 'solved-first-time']);
}

function loadMyQuestions() {
    // Show the appropriate view and hide other views
    document.querySelector('#allquestions-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#question-view').style.display = 'none';

    // Fetch the user's questions from the backend
    fetch('/questions/myquestions')
        .then(response => response.json())
        .then(questions => {
            // Create and populate the table
            const table = createQuestionTable(questions);

            // Replace the content of the allquestions-view with the table
            const allQuestionsView = document.querySelector('#allquestions-view');
            allQuestionsView.innerHTML = '';
            document.querySelector('#allquestions-view').innerHTML = `<h3>My Questions</h3>`;
            allQuestionsView.appendChild(table);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while loading your questions.');
        });
}


function createQuestionTable(questions) {
    const table = document.createElement('table');
    table.classList.add('table', 'table-striped');

    // Create the table header
    const headerRow = table.insertRow();
    const headers = ['Number', 'Title', 'Difficulty', 'Tags', 'Attempts'];
    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });

    // Populate the table rows with question data
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

function clearFormFields(fieldIds) {
    fieldIds.forEach(id => {
        const field = document.querySelector(`#${id}`);
        field.value = '';
        field.classList.remove('is-valid', 'is-invalid');
    });
}

function addQ() {
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
