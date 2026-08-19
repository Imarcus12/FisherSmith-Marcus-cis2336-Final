async function searchStudent(event) {
    event.preventDefault();
    const name = document.getElementById('studentName').value;

    try {
        const response = await fetch('http://localhost:3000/find-student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });

        if (response.status === 404) {
            alert("Cannot find the student.");
            return;
        }

        if (!response.ok) {
            alert("An error occurred while searching for the student.");
            return;
        }

        const student = await response.json();
        document.getElementById('resultTable').innerHTML = `
            <tr>
                <td>${student.name}</td>
                <td>${student.id}</td>
                <td>${student.phone}</td>
                <td>${student.zip}</td>
                <td><button type="button" onclick="deleteStudent('${encodeURIComponent(student.name)}')">Delete</button></td>
            </tr>
        `;
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while searching for the student.");
    }
}

async function deleteStudent(encodedName) {
    const name = decodeURIComponent(encodedName);

    if (!confirm(`Delete student ${name}?`)) {
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/delete-student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });

        if (response.status === 404) {
            alert("Student not found or already deleted.");
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.error}`);
            return;
        }

        alert("Student deleted successfully.");
        document.getElementById('resultTable').innerHTML = '';
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the student.");
    }
}

async function addStudent(event) {
    event.preventDefault();
    const name = document.getElementById('addName').value;
    const id = document.getElementById('addId').value;
    const phone = document.getElementById('addPhone').value;
    const zip = document.getElementById('addZip').value;

    try {
        const response = await fetch('http://localhost:3000/add-student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, id, phone, zip })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.error}`);
            return;
        }

        alert("Student added successfully!");
        document.querySelector('form[onsubmit="addStudent(event)"]').reset();
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while adding the student.");
    }
}
async function addCourse(event) {
    event.preventDefault();

    const id = document.getElementById('classId').value;
    const name = document.getElementById('className').value;

    try {
        const response = await fetch('http://localhost:3000/add-course', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, name })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.error}`);
            return;
        }

        alert("Course added successfully!");
        document.getElementById('courseForm').reset();
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while adding the course.");
    }
}
async function listCourses() {
    try {
        const response = await fetch('http://localhost:3000/list-courses');

        if (!response.ok) {
            alert("An error occurred while loading the courses.");
            return;
        }

        const courses = await response.json();

        const table = document.getElementById('courseTable');
        table.innerHTML = '';

        courses.forEach(course => {
            table.innerHTML += `
                <tr>
                    <td>${course.id}</td>
                    <td>${course.name}</td>
                    <td>
                        <button type="button" onclick="deleteCourse('${encodeURIComponent(course.id)}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while loading the courses.");
    }
}
async function deleteCourse(encodedId) {
    const id = decodeURIComponent(encodedId);

    if (!confirm(`Delete course ${id}?`)) {
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/delete-course', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });

        if (response.status === 404) {
            alert("Course not found.");
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.error}`);
            return;
        }

        alert("Course deleted successfully.");

        // Refresh the list after deletion
        listCourses();

    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the course.");
    }
}
async function loadEnrollmentOptions() {
    try {
        const studentResponse = await fetch('http://localhost:3000/list-students');
        const courseResponse = await fetch('http://localhost:3000/list-courses');

        if (!studentResponse.ok || !courseResponse.ok) {
            alert("An error occurred while loading students or courses.");
            return;
        }

        const students = await studentResponse.json();
        const courses = await courseResponse.json();

        const studentSelect = document.getElementById('studentSelect');
        const courseSelect = document.getElementById('courseSelect');
        const enrollmentCourseSelect = document.getElementById('enrollmentCourseSelect');

        studentSelect.innerHTML =
            '<option value="">-- Select Student --</option>';

        courseSelect.innerHTML =
            '<option value="">-- Select Course --</option>';

        enrollmentCourseSelect.innerHTML =
            '<option value="">-- Select Course --</option>';

        students.forEach(student => {
            studentSelect.innerHTML += `
                <option value="${student.id}">
                    ${student.name} (${student.id})
                </option>
            `;
        });

courses.forEach(course => {
    const option = `
        <option value="${course.id}">
            ${course.name} (${course.id})
        </option>
    `;

    courseSelect.innerHTML += option;
    enrollmentCourseSelect.innerHTML += option;
});

} catch (error) {
    console.error("Error:", error);
    alert("An error occurred while loading enrollment options.");
}
}
async function addEnrollment(event) {
    event.preventDefault();

    const studentId = document.getElementById('studentSelect').value;
    const courseId = document.getElementById('courseSelect').value;

    try {
        const response = await fetch('http://localhost:3000/add-enrollment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId, courseId })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.error}`);
            return;
        }

        alert("Student enrolled successfully!");
        document.getElementById('enrollmentForm').reset();

    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while enrolling the student.");
    }
}
async function listStudentsInCourse() {
    const courseId =
        document.getElementById('enrollmentCourseSelect').value;

    if (!courseId) {
        alert("Please select a course.");
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/course-enrollments/${encodeURIComponent(courseId)}`
        );

        if (!response.ok) {
            alert("An error occurred while loading enrolled students.");
            return;
        }

        const students = await response.json();

        const table = document.getElementById('enrollmentTable');
        table.innerHTML = '';

        students.forEach(student => {
            table.innerHTML += `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.id}</td>
                    <td>${student.phone}</td>
                    <td>${student.zip}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while loading enrolled students.");
    }
}