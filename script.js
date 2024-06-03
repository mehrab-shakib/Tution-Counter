document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('studentForm');
    const studentNameInput = document.getElementById('studentName');
    const studentsList = document.getElementById('studentsList');
    const dateModal = document.getElementById('dateModal');
    const dateTableBody = document.querySelector('#dateTable tbody');
    const spanClose = document.getElementsByClassName('close')[0];
    let students = JSON.parse(localStorage.getItem('students')) || {};
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
document.getElementById('currentMonth').textContent = `Current Month: ${currentMonth}`;

    // Initialize students list from localStorage
    for (let studentName in students) {
        addStudentToList(studentName, students[studentName].count);
    }

    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const studentName = studentNameInput.value.trim();
        if (studentName && !students[studentName]) {
            students[studentName] = { count: 0, dates: [] };
            addStudentToList(studentName, 0);
            updateLocalStorage();
            studentNameInput.value = '';
        }
    });

    function addStudentToList(studentName, count) {
        const studentDiv = document.createElement('div');
        studentDiv.className = 'student';
        studentDiv.innerHTML = `
            <div class="student-header">
                <span class="student-name">${studentName}</span>
                <span class="student-days">Days: <span id="count-${studentName}">${count}</span></span>
            </div>
            <div class="student-buttons">
                <button onclick="incrementCounter('${studentName}')">Increment</button>
                <button onclick="decrementCounter('${studentName}')">Decrement</button>
                <button onclick="showDates('${studentName}')">Show Dates</button>
                <button onclick="deleteStudent('${studentName}')">Delete</button>
            </div>
        `;
        studentsList.appendChild(studentDiv);
    }

    window.incrementCounter = (studentName) => {
        const date = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-BD', options);
        students[studentName].count += 1;
        students[studentName].dates.push(formattedDate);
        document.getElementById(`count-${studentName}`).textContent = students[studentName].count;
        updateLocalStorage();
    }

    window.decrementCounter = (studentName) => {
        if (students[studentName].count > 0) {
            students[studentName].count -= 1;
            students[studentName].dates.pop();
            document.getElementById(`count-${studentName}`).textContent = students[studentName].count;
            updateLocalStorage();
        }
    }

    window.showDates = (studentName) => {
        dateTableBody.innerHTML = '';
        students[studentName].dates.forEach(date => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = date;
            row.appendChild(cell);
            dateTableBody.appendChild(row);
        });
        dateModal.style.display = 'block';

        // Add download button
        let downloadButton = dateModal.querySelector('.modal-content button');
        if (!downloadButton) {
            downloadButton = document.createElement('button');
            downloadButton.textContent = 'Download as PDF';
            downloadButton.onclick = () => downloadPDF(studentName);
            dateModal.querySelector('.modal-content').appendChild(downloadButton);
        }
    }

    window.deleteStudent = (studentName) => {
        delete students[studentName];
        updateLocalStorage();
        document.getElementById(`count-${studentName}`).parentElement.parentElement.remove();
    }

    function updateLocalStorage() {
        localStorage.setItem('students', JSON.stringify(students));
    }

    function downloadPDF(studentName) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text(`Date Log for ${studentName}`, 10, 10);
        students[studentName].dates.forEach((date, index) => {
            doc.text(date, 10, 20 + (index * 10));
        });
        doc.save(`${studentName}_date_log.pdf`);
    }

    spanClose.onclick = () => {
        dateModal.style.display = 'none';
        const downloadButton = dateModal.querySelector('.modal-content button');
        if (downloadButton) downloadButton.remove();
    }

    window.onclick = (event) => {
        if (event.target == dateModal) {
            dateModal.style.display = 'none';
            const downloadButton = dateModal.querySelector('.modal-content button');
            if (downloadButton) downloadButton.remove();
        }
    }
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', () => {
        // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to reset the counts?");
    
    // If user confirms, reset the counts and date logs
    if (confirmed) {
        for (let studentName in students) {
            students[studentName].count = 0;
            students[studentName].dates = []; // Clear the date log
            document.getElementById(`count-${studentName}`).textContent = students[studentName].count;
        }
    
        // Clear the local storage
        localStorage.setItem('students', JSON.stringify(students));
    }
    });
});
