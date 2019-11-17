const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');
// const view = require("./lib/view");
// const add = require("./lib/add");

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

// Bonus points if you're able to:
//     Update an employees managers
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
                "View all employees",
                "View all managers",
                "View employees by manager",
                "View all departments",
                "View all roles",
                "Add a new employee",
                "Add a new department",
                "Add a new role",
                "Update an employee's role",
                "Update an employee's manager",
                "Exit"
            ]
        })
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            if (answer.mainMenuQuestions === "View all employees") {
                viewEmployee();
            }
            else if (answer.mainMenuQuestions === "View all managers") {
                viewManagers();
            }
            else if (answer.mainMenuQuestions === "View employees by manager") {
                viewByManager();
            }
            else if (answer.mainMenuQuestions === "View all departments") {
                viewDept();
            }
            else if (answer.mainMenuQuestions === "View all roles") {
                viewRole();
            } else if (answer.mainMenuQuestions === "Add a new employee") {
                addEmployee()
            }
            else if (answer.mainMenuQuestions === "Add a new department") {
                addDept();
            }
            else if (answer.mainMenuQuestions === "Add a new role") {
                addRole();
            }
            else if (answer.mainMenuQuestions === "Update an employeye's role") {
                updateRole();
            }
            else if (answer.mainMenuQuestions === "Update an employee's manager") {
                updateManager();
            } else {
                console.log("**************")
                connection.end();
            }
        });
}

function viewEmployee() {
    connection.query("SELECT first_name AS First, last_name AS Last, role.title as Role, role.salary AS Salary FROM employee INNER JOIN department ON department.id = employee.department_id left JOIN role ON role.id = employee.role_id", function (err, results) {
        if (err) throw err;
        console.table("List of Roles:", results);
        mainMenu();
    });
}

function viewManagers() {
    connection.query("SELECT first_name AS First, last_name AS Last, department.name AS Department FROM employee INNER JOIN department ON department.id = employee.department_id WHERE manager_id IS NULL", function (err, results) {
        if (err) throw err;
        console.table("List of Managers:", results);
        mainMenu();
    });
}

function viewByManager() {
    connection.query("SELECT * FROM employee WHERE manager_id IS NULL", function (err, results) {
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
                            return choiceArray;
                        },
                        message: "Which manager would you like to view?"
                    }
                ])
                .then(function (answer) {
                    // get the information of the chosen item
                    let managersId;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].first_name + " " + results[i].last_name === answer.choice) {
                            managersId = results[i].id;
                        }
                    }
                    if (err) throw err;
                    connection.query("SELECT first_name AS First, last_name AS Last, role.title as Role, role.salary AS Salary, department.name AS Department FROM employee INNER JOIN department ON department.id = employee.department_id left JOIN role ON role.id = employee.role_id WHERE manager_id = " + managersId, function (err, results) {
                        if (err) throw err;
                        console.table("List of Employees managed by " + answer.choice + ":", results);
                        mainMenu();
                    });
                });
        } else {
            console.log("There are no managers to view.");
            mainMenu();
        }
    });
}

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

                connection.query("SELECT * FROM employee WHERE manager_id IS NULL", function (err, results) {
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

function updateRole() {
    connection.query("SELECT * FROM employee", function (err, results) {
        if (err) throw err;
        // once you have the items, prompt the user for which they'd like to bid on
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
                            return choiceArray;
                        },
                        message: "What department does this role belong to?"
                    }
                ])
                .then(function (answer) {
                    // get the information of the chosen item
                    let myEmpChoice;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].first_name + " " + results[i].last_name === answer.choice) {
                            myEmpChoice = results[i];
                        }
                    }
                    connection.query("SELECT * FROM role", function (err, results) {
                        if (err) throw err;
                        inquirer
                            .prompt([
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
                                    message: "What is the new role of this employee?"
                                }
                            ])
                            .then(function (answer2) {
                                let myRoleChoice;
                                for (var i = 0; i < results.length; i++) {
                                    if (results[i].title === answer2.choice) {
                                        myRoleChoice = results[i];
                                    }
                                }
                                connection.query(
                                    "Update employee SET role_id = " + myRoleChoice.id + ", department_id = " + myRoleChoice.department_id + " WHERE ID =" + myEmpChoice.id,
                                    function (err) {
                                        if (err) throw err;
                                        console.log("The employee's role was updated!");
                                        mainMenu();
                                    }
                                );
                            });
                    })
                });
        } else {
            console.log("At least one department must be created to create a role.")
            mainMenu();
        }
    });
}

function updateManager() {
    connection.query("SELECT * FROM employee WHERE manager_id IS NOT NULL", function (err, results) {
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
                            return choiceArray;
                        },
                        message: "Who's manager would you like to update?"
                    }
                ])
                .then(function (answer) {
                    // get the information of the chosen item
                    let myEmpChoice;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].first_name + " " + results[i].last_name === answer.choice) {
                            myEmpChoice = results[i];
                        }
                    }
                    connection.query("SELECT * FROM employee WHERE manager_id IS NULL", function (err, results) {
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
                                        message: "Who is this emmployee's new manager?"
                                    }
                                ])
                                .then(function (answer2) {
                                    let myNewManager;
                                    for (var i = 0; i < results.length; i++) {
                                        if (results[i].first_name + " " + results[i].last_name === answer2.choice) {
                                            myNewManager = results[i];
                                        }
                                    }
                                    connection.query(
                                        "Update employee SET manager_id = " + myNewManager.id + " WHERE ID = " + myEmpChoice.id,
                                        function (err) {
                                            if (err) throw err;
                                            console.log("The new employees manager has been updated Please update their role if required.");
                                            mainMenu();
                                        }
                                    );
                                });
                        } else {
                            console.log("There are no employees to choose from.");
                            mainMenu();
                        }
                    });
                });
        } else {
            console.log("There are no employees to choose from.");
            mainMenu();
        }
    });
}