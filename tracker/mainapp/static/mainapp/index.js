/* when the DOM content of the page has been loaded, 
  we attach event listeners to each of the buttons. 
  
  Ensures use of the function to only run the code once all content has loaded
   
   */
  document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    // document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    // document.querySelector('form').onsubmit = () => send_mail();
    
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
