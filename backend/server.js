const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'students.json');
const COURSE_FILE = path.join(__dirname, 'courses.json');
const ENROLLMENT_FILE = path.join(__dirname, 'enrollments.json');

async function loadStudents() {
    try {
        const data = await fs.promises.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error('Error reading students file:', error);
        return [];
    }
}

async function saveStudents(students) {
    try {
        await fs.promises.writeFile(DATA_FILE, JSON.stringify(students, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing students file:', error);
        throw error;
    }
}

async function loadCourses() {
    try {
        const data = await fs.promises.readFile(COURSE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error('Error reading courses file:', error);
        return [];
    }
}

async function saveCourses(courses) {
    try {
        await fs.promises.writeFile(
            COURSE_FILE,
            JSON.stringify(courses, null, 2),
            'utf8'
        );
    } catch (error) {
        console.error('Error writing courses file:', error);
        throw error;
    }
}
// Endpoint to search for a student by name
app.post('/find-student', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).send({ error: 'Student name is required' });
        }

        const students = await loadStudents();
        const student = students.find((item) => item.name === name);
        if (!student) {
            return res.status(404).send({ error: 'Student not found' });
        }

        res.send(student);
    } catch (error) {
        console.error('Error finding student:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Endpoint to save a student
app.post('/add-student', async (req, res) => {
    try {
        const { name, id, phone, zip } = req.body;
        if (!name || !id || !phone || !zip) {
            return res.status(400).send({ error: 'All fields (name, id, phone, zip) are required' });
        }

        const students = await loadStudents();
        const newStudent = { name, id, phone, zip };
        students.push(newStudent);
        await saveStudents(students);

        res.status(201).send({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Endpoint to delete a student
app.post('/delete-student', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).send({
                error: 'Student name is required'
            });
        }

        const students = await loadStudents();

        const index = students.findIndex((item) => item.name === name);

        if (index === -1) {
            return res.status(404).send({
                error: 'Student not found'
            });
        }

        const deletedStudent = students.splice(index, 1)[0];

        await saveStudents(students);

        // Remove any enrollments for this student
        const enrollments = await loadEnrollments();

        const updatedEnrollments = enrollments.filter(
            (enrollment) => enrollment.studentId !== deletedStudent.id
        );

        await saveEnrollments(updatedEnrollments);

        res.send({
            message: 'Student deleted successfully',
            student: deletedStudent
        });

    } catch (error) {
        console.error('Error deleting student:', error);

        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to add a course
app.post('/add-course', async (req, res) => {
    try {
        const { id, name } = req.body;

        if (!id || !name) {
            return res.status(400).send({
                error: 'Class ID and Class Name are required'
            });
        }

        const courses = await loadCourses();

        const newCourse = { id, name };

        courses.push(newCourse);
        await saveCourses(courses);

        res.status(201).send({
            message: 'Course added successfully',
            course: newCourse
        });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to list all courses
app.get('/list-courses', async (req, res) => {
    try {
        const courses = await loadCourses();
        res.send(courses);
    } catch (error) {
        console.error('Error listing courses:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to delete a course
app.post('/delete-course', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).send({
                error: 'Class ID is required'
            });
        }

        const courses = await loadCourses();

        const index = courses.findIndex(
            (course) => course.id === id
        );

        if (index === -1) {
            return res.status(404).send({
                error: 'Course not found'
            });
        }

        const deletedCourse = courses.splice(index, 1)[0];

        await saveCourses(courses);

        // Remove any enrollments for this course
        const enrollments = await loadEnrollments();

        const updatedEnrollments = enrollments.filter(
            (enrollment) => enrollment.courseId !== deletedCourse.id
        );

        await saveEnrollments(updatedEnrollments);

        res.send({
            message: 'Course deleted successfully',
            course: deletedCourse
        });

    } catch (error) {
        console.error('Error deleting course:', error);

        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

async function loadEnrollments() {
    try {
        const data = await fs.promises.readFile(ENROLLMENT_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }

        console.error('Error reading enrollments file:', error);
        return [];
    }
}
async function saveEnrollments(enrollments) {
    try {
        await fs.promises.writeFile(
            ENROLLMENT_FILE,
            JSON.stringify(enrollments, null, 2),
            'utf8'
        );
    } catch (error) {
        console.error('Error writing enrollments file:', error);
        throw error;
    }
}

// Endpoint to list all students
app.get('/list-students', async (req, res) => {
    try {
        const students = await loadStudents();
        res.send(students);
    } catch (error) {
        console.error('Error listing students:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to add an enrollment
app.post('/add-enrollment', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;

        if (!studentId || !courseId) {
            return res.status(400).send({
                error: 'Student and course are required'
            });
        }

        const students = await loadStudents();
        const courses = await loadCourses();
        const enrollments = await loadEnrollments();

        // Make sure the student exists
        const studentExists = students.some(
            student => student.id === studentId
        );

        if (!studentExists) {
            return res.status(404).send({
                error: 'Student not found'
            });
        }

        // Make sure the course exists
        const courseExists = courses.some(
            course => course.id === courseId
        );

        if (!courseExists) {
            return res.status(404).send({
                error: 'Course not found'
            });
        }

        // Prevent duplicate enrollment
        const alreadyEnrolled = enrollments.some(
            enrollment =>
                enrollment.studentId === studentId &&
                enrollment.courseId === courseId
        );

        if (alreadyEnrolled) {
            return res.status(400).send({
                error: 'Student is already enrolled in this course'
            });
        }

        // Add the enrollment
        const newEnrollment = {
            studentId,
            courseId
        };

        enrollments.push(newEnrollment);

        await saveEnrollments(enrollments);

        res.status(201).send({
            message: 'Student enrolled successfully',
            enrollment: newEnrollment
        });

    } catch (error) {
        console.error('Error adding enrollment:', error);

        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to get all students enrolled in a course
app.get('/course-enrollments/:courseId', async (req, res) => {
    try {
        const courseId = req.params.courseId;

        const enrollments = await loadEnrollments();
        const students = await loadStudents();

        const enrolledStudentIds = enrollments
            .filter((enrollment) => enrollment.courseId === courseId)
            .map((enrollment) => enrollment.studentId);

        const enrolledStudents = students.filter((student) =>
            enrolledStudentIds.includes(student.id)
        );

        res.send(enrolledStudents);

    } catch (error) {
        console.error('Error getting course enrollments:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
