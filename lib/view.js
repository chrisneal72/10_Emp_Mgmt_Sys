const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');
const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "admin",
    database: "emp_mgmt_db"
});

connection.connect(function (err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId + "\n");
});

function viewDept() {
    connection.query("SELECT name AS Name FROM department", function (err, results) {
        if (err) throw err;
        console.table("List of Departments:", results);
        mainMenu();
    });
}

function viewRole() {
    connection.query("SELECT title  AS Title, salary AS Salary, department.name AS Department FROM role INNER JOIN department ON department.id = role.department_id", function (err, results) {
        if (err) throw err;
        console.table("List of Roles:", results);
        mainMenu();
    });
}


function viewEmployee() {
    connection.query("SELECT first_name AS First, last_name AS Last, role.title as Role, role.salary AS Salary FROM employee INNER JOIN department ON department.id = employee.department_id left JOIN role ON role.id = employee.role_id", function (err, results) {
        if (err) throw err;
        console.table("List of Roles:", results);
        mainMenu();
    });
}

module.exports = {
    viewDept,
    viewRole,
    viewEmployee
 }