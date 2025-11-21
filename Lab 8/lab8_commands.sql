-- Lab 8: SQL & PHP
-- Database and Table Creation with Queries

-- ========================================
-- PART 1: Create Database and Initial Tables
-- ========================================

-- Create the database
CREATE DATABASE IF NOT EXISTS websyslab8;
USE websyslab8;

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    crn INT(11) PRIMARY KEY,
    prefix VARCHAR(4) NOT NULL,
    number SMALLINT(4) NOT NULL,
    title VARCHAR(255) NOT NULL
) COLLATE utf8_unicode_ci;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    rin INT(9) PRIMARY KEY,
    rcsID CHAR(7),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    alias VARCHAR(100) NOT NULL,
    phone INT(10)
) COLLATE utf8_unicode_ci;

-- ========================================
-- PART 2: Modify Tables and Insert Data
-- ========================================

-- Question 1: Add address fields to students table
ALTER TABLE students
ADD COLUMN street VARCHAR(255),
ADD COLUMN city VARCHAR(100),
ADD COLUMN state CHAR(2),
ADD COLUMN zip VARCHAR(10);

-- Question 2: Add section and year fields to courses table
ALTER TABLE courses
ADD COLUMN section VARCHAR(10),
ADD COLUMN year YEAR;

-- Question 3: CREATE grades table
CREATE TABLE IF NOT EXISTS grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crn INT(11),
    rin INT(9),
    grade INT(3) NOT NULL,
    FOREIGN KEY (crn) REFERENCES courses(crn),
    FOREIGN KEY (rin) REFERENCES students(rin)
);

-- Question 4: INSERT at least 4 courses
INSERT INTO courses (crn, prefix, number, title, section, year) VALUES
(12345, 'ITWS', 2110, 'Introduction to Web Science', '01', 2025),
(12346, 'CSCI', 1100, 'Computer Science I', '02', 2025),
(12347, 'MATH', 1010, 'Calculus I', '03', 2025),
(12348, 'ENGR', 1600, 'Introduction to Engineering', '01', 2025);

-- Question 5: INSERT at least 4 students
INSERT INTO students (rin, rcsID, first_name, last_name, alias, phone, street, city, state, zip) VALUES
(661234567, 'smithj', 'John', 'Smith', 'Johnny', 5181234567, '123 Main St', 'Troy', 'NY', '12180'),
(661234568, 'doej', 'Jane', 'Doe', 'JD', 5181234568, '456 Oak Ave', 'Albany', 'NY', '12201'),
(661234569, 'brownm', 'Michael', 'Brown', 'Mike', 5181234569, '789 Pine Rd', 'Troy', 'NY', '12180'),
(661234570, 'johnsa', 'Alice', 'Johnson', 'Ally', 5181234570, '321 Elm St', 'Schenectady', 'NY', '12305');

-- Question 6: ADD 10 grades into the grades table
INSERT INTO grades (crn, rin, grade) VALUES
(12345, 661234567, 95),
(12345, 661234568, 88),
(12345, 661234569, 92),
(12346, 661234567, 85),
(12346, 661234568, 91),
(12346, 661234570, 78),
(12347, 661234569, 96),
(12347, 661234570, 82),
(12348, 661234567, 89),
(12348, 661234568, 94);

-- Question 7: List all students in alphabetical order by rin, last name, RCSid, and firstname
-- By RIN
SELECT * FROM students ORDER BY rin;

-- By Last Name
SELECT * FROM students ORDER BY last_name;

-- By RCSid
SELECT * FROM students ORDER BY rcsID;

-- By First Name
SELECT * FROM students ORDER BY first_name;

-- Question 8: List all students rin, name and address if their grade in any course was higher than 90
SELECT DISTINCT s.rin, s.first_name, s.last_name, s.street, s.city, s.state, s.zip
FROM students s
JOIN grades g ON s.rin = g.rin
WHERE g.grade > 90;

-- Question 9: List out the average grade in each course
SELECT c.crn, c.prefix, c.number, c.title, AVG(g.grade) AS average_grade
FROM courses c
JOIN grades g ON c.crn = g.crn
GROUP BY c.crn, c.prefix, c.number, c.title;

-- Question 10: List out the number of students in each course
SELECT c.crn, c.prefix, c.number, c.title, COUNT(DISTINCT g.rin) AS student_count
FROM courses c
JOIN grades g ON c.crn = g.crn
GROUP BY c.crn, c.prefix, c.number, c.title;
