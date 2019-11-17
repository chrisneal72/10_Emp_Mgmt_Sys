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
    mainMenu();
});

// console.table

// Add an employee
// Add a department
// Add a role
// View all departments
// View all roles
// View employees
// Update an employees role

// Bonus points if you're able to:
//     Update an employees managers
//     View employees by manager
//     Delete departments
//     Delete a role
//     Delete an employee
//     View the total utilized budget of a department

function mainMenu() {
    inquirer
        .prompt({
            name: "mainMenuQuestions",
            type: "list",
            message: "Would you like to do?",
            choices: [
                "Add a new employee",
                "Add a new department",
                "Add a new role",
                "View departments",
                "View roles",
                "View employees",
                "Update an employees role",
                "Exit"
            ]
        })
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            if (answer.mainMenuQuestions === "Add a new employee") {
                addEmployee();
            }
            else if (answer.mainMenuQuestions === "Add a new department") {
                addDept();
            }
            else if (answer.mainMenuQuestions === "Add a new role") {
                addRole();
            }
            else if (answer.mainMenuQuestions === "View departments") {
                viewDept();
            }
            else if (answer.mainMenuQuestions === "View roles") {
                mainMenu();
            }
            else if (answer.mainMenuQuestions === "View employees") {
                mainMenu();
            }
            else if (answer.mainMenuQuestions === "Update an employye's role") {
                mainMenu();
            } else {
                console.log("**************")
                connection.end();
            }
        });
}

function addDept() {
    console.log("Adding a new Department...\n");
    inquirer
        .prompt([
            {
                name: "name",
                type: "input",
                message: "What is name of the new department?"
            }
        ])
        .then(function (answer) {
            // when finished prompting, insert a new item into the db with that info
            connection.query(
                "INSERT INTO department SET ?",
                answer,
                function (err) {
                    if (err) throw err;
                    console.log("The new department was added!");
                    // re-prompt the user for if they want to bid or post
                    mainMenu();
                }
            );
        });
}

function addRole() {
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        // once you have the items, prompt the user for which they'd like to bid on
        if (results.length > 0) {
            inquirer
                .prompt([
                    {
                        name: "title",
                        type: "input",
                        message: "What is the title of the new role?"
                    },
                    {
                        name: "salary",
                        type: "input",
                        message: "What is the salary of the new role?"
                    },
                    {
                        name: "choice",
                        type: "rawlist",
                        choices: function () {
                            var choiceArray = [];
                            for (var i = 0; i < results.length; i++) {
                                choiceArray.push(results[i].name);
                            }
                            return choiceArray;
                        },
                        message: "What department does this role belong to?"
                    }
                ])
                .then(function (answer) {
                    // get the information of the chosen item
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].name === answer.choice) {
                            answer.department_id = results[i].id;
                        }
                    }

                    connection.query(
                        "INSERT INTO role SET ?",
                        {
                            title: answer.title,
                            salary: answer.salary,
                            department_id: answer.department_id,
                        },
                        function (err) {
                            if (err) throw err;
                            console.log("The new department was added!");
                            // re-prompt the user for if they want to bid or post
                            mainMenu();
                        }
                    );
                });
        } else {
            console.log("At least one department must be created to create a role.")
            mainMenu();
        }
    });
}

function addEmployee() {
    connection.query("SELECT * FROM role", function (err, results) {
        if (err) throw err;
        // once you have the items, prompt the user for which they'd like to bid on
        inquirer
            .prompt([
                {
                    name: "first_name",
                    type: "input",
                    message: "What is the employee's first name?"
                },
                {
                    name: "last_name",
                    type: "input",
                    message: "What is the employee's last name?"
                },
                {
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].title);
                        }
                        return choiceArray;
                    },
                    message: "What is the employee's role?"
                }
            ])
            .then(function (answer) {
                // get the information of the chosen item
                for (var i = 0; i < results.length; i++) {
                    if (results[i].title === answer.choice) {
                        answer.role_id = results[i].id;
                        answer.department_id = results[i].department_id;
                    }
                }

                connection.query("SELECT * FROM employee", function (err, results) {
                    if (err) throw err;
                    if (results.length > 0) {
                        inquirer
                            .prompt([
                                {
                                    name: "choice",
                                    type: "rawlist",
                                    choices: function () {
                                        var choiceArray = [];
                                        for (var i = 0; i < results.length; i++) {
                                            choiceArray.push(results[i].first_name + " " + results[i].last_name);
                                        }
                                        choiceArray.push("None");
                                        return choiceArray;
                                    },
                                    message: "Who is this emmployee's manager?"
                                }
                            ])
                            .then(function (answer2) {
                                // get the information of the chosen item
                                for (var i = 0; i < results.length; i++) {
                                    if (results[i].first_name + " " + results[i].last_name === answer2.choice) {
                                        answer.manager_id = results[i].id;
                                    }
                                }
                                if (err) throw err;
                                connection.query(
                                    "INSERT INTO employee SET ?",
                                    {
                                        first_name: answer.first_name,
                                        last_name: answer.last_name,
                                        role_id: answer.role_id,
                                        manager_id: answer.manager_id,
                                        department_id: answer.department_id
                                    },
                                    function (err) {
                                        if (err) throw err;
                                        console.log("The new employee was added!");
                                        mainMenu();
                                    }
                                );

                            });
                    } else {
                        console.log("There are no managers available to add.");
                        console.log(answer);
                        connection.query(
                            "INSERT INTO employee SET ?",
                            {
                                first_name: answer.first_name,
                                last_name: answer.last_name,
                                role_id: answer.role_id,
                                department_id: answer.department_id
                            },
                            function (err) {
                                if (err) throw err;
                                console.log("The new employee was added!");
                                mainMenu();
                            }
                        );
                    }
                });
            });
    });
}

function viewDept(){
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        console.table(results);
        mainMenu();
    });
}