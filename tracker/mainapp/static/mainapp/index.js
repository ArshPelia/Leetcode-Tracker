/* when the DOM content of the page has been loaded, 
  we attach event listeners to each of the buttons. 
  
  Ensures use of the function to only run the code once all content has loaded
   
   */
document.addEventListener('DOMContentLoaded', function() {

// Use buttons to toggle between views
// document.querySelector('form').onsubmit = () => send_mail();
    document.querySelector('#compose').addEventListener('click', () => compose_question());


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
            const table = document.createElement('table');
            table.classList.add('table', 'table-striped'); // Add Bootstrap classes for styling

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

            // Replace the content of the allquestions-view with the table
            const allQuestionsView = document.querySelector('#allquestions-view');
            allQuestionsView.innerHTML = ''; // Clear existing content
                // Show the view name
            document.querySelector('#allquestions-view').innerHTML = `<h3>All Questions</h3>`;
            allQuestionsView.appendChild(table);
        });
}

function compose_question() {
    // Show compose view and hide other views
    document.querySelector('#allquestions-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    const titleField = document.querySelector('#title');
    const numberField = document.querySelector('#number');  // Add this line
    const descriptionField = document.querySelector('#description');  // Add this line
    const difficultyField = document.querySelector('#difficulty');
    const tagsField = document.querySelector('#tags');
    const urlField = document.querySelector('#url');  // Add this line

    titleField.value = '';  // Clear the title input
    numberField.value = '';  // Clear the number input
    descriptionField.value = '';  // Clear the description input
    difficultyField.value = 'easy';  // Reset to default difficulty
    tagsField.value = '';  // Clear the tags input
    urlField.value = '';  // Clear the URL input

    // Optional: You could also reset the form validation state if needed
    titleField.classList.remove('is-valid', 'is-invalid');
    numberField.classList.remove('is-valid', 'is-invalid');  // Add this line
    descriptionField.classList.remove('is-valid', 'is-invalid');  // Add this line
    difficultyField.classList.remove('is-valid', 'is-invalid');
    tagsField.classList.remove('is-valid', 'is-invalid');
    urlField.classList.remove('is-valid', 'is-invalid');  // Add this line

    // Handle form submission and send data to the backend
    const composeForm = document.querySelector('#compose-form');
    composeForm.addEventListener('submit', function(event) {
        event.preventDefault();  // Prevent the default form submission

        // Collect form data
        const formData = new FormData(composeForm);
        const postData = {};
        formData.forEach((value, key) => {
            postData[key] = value;
        });

        // Send data to the backend (you'll need to handle this using fetch)
        fetch('/questions/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other headers if needed
            },
            body: JSON.stringify(postData),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the backend (e.g., show success message)
            console.log(data);  // Log the response for debugging
        })
        .catch(error => {
            console.error('Error:', error);  // Log any errors that occur
        });
    });
}
