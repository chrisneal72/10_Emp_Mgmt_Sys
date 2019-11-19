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

// Remaining bonus options:
//     Delete departments
//     Delete a role
//     View the total utilized budget of a department

// NOTES FOR POSSIBLE ADJUSTMENT
// IN ADD ROLE, THERE SHOULD BE A NONE OPTION FOR THE DEPT SO THAT IF A PROPER DEPT DOES NOT EXIST THEY WILL STEP BACK TO THE MAIN MENU
// NONE OPTION IN ADD EMPLOYEE FOR THE ROLE TO KILL THE PROCESS IF THE PROPER ROLE DOES NOT EXIST

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
                "Delete an employee",
                "Exit"
            ]
        })
        .then(function (answer) {
            switch (answer.mainMenuQuestions) {
                case "View all employees":
                    viewEmployee();
                    break;
                case "View all managers":
                    viewManagers();
                    break;
                case "View employees by manager":
                    viewByManager();
                    break;
                case "View all departments":
                    viewDept();
                    break;
                case "View all roles":
                    viewRole();
                    break;
                case "Add a new employee":
                    addEmployee();
                    break;
                case "Add a new department":
                    addDept();
                    break;
                case "Add a new role":
                    addRole();
                    break;
                case "Update an employee's role":
                    updateRole();
                    break;
                case "Update an employee's manager":
                    updateManager();
                    break;
                case "Delete an employee":
                    deleteEmployee();
                    break;
                default:
                    console.log("**************")
                    connection.end();
            }
        });
}

// VIEWING ALL EMPLOYEES AND SHOWING THIER ROLE AND DEPARTMENT
function viewEmployee() {
    connection.query("SELECT first_name AS First, last_name AS Last, role.title as Role, role.salary AS Salary, department.name AS Department FROM employee INNER JOIN department ON department.id = employee.department_id left JOIN role ON role.id = employee.role_id", function (err, results) {
        if (err) throw err;
        console.table("List of Roles:", results);
        mainMenu();
    });
}

// VIEWING ALL MANAGERS AND THEIR DEPARTMENT. I AM DOING THIS BY ASSUMING ANY EMPLOYEE WITH NO 
// MANAGER ASSIGNED IS A MANAGER. THIS IS THE APPROACH I TOOK FROM THE START OF THE ASSIGNMENT
function viewManagers() {
    connection.query("SELECT first_name AS First, last_name AS Last, department.name AS Department FROM employee INNER JOIN department ON department.id = employee.department_id WHERE manager_id IS NULL", function (err, results) {
        if (err) throw err;
        console.table("List of Managers:", results);
        mainMenu();
    });
}

// VIEW EMPLOYEE BY MANAGER. FIRST THE USER SELECTS A MANAGER AND THEN THE EMPLOYEES UNDER THEM ARE DISPLAYED
function viewByManager() {
    // FIND ALL EMPLOYEES THAT DO NOT HAVE A MANAGER AS THIS MEANS THEY ARE A MANAGER AND OFFER AS A SELECTION
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
                    // GET THE ID OF THE CHOSEN MANAGER
                    let managersId;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].first_name + " " + results[i].last_name === answer.choice) {
                            managersId = results[i].id;
                        }
                    }
                    if (err) throw err;
                    // SEARCH FOR THE EMPLOYEES WITH THE MANAGER_ID OF THE CHOSEN MANAGER
                    connection.query("SELECT first_name AS First, last_name AS Last, role.title as Role, role.salary AS Salary, department.name AS Department FROM employee INNER JOIN department ON department.id = employee.department_id left JOIN role ON role.id = employee.role_id WHERE ?", { manager_id: managersId }, function (err, results) {
                        if (err) throw err;
                        // TITLE THE CONSOLE TABLE USING THE MANAGERS NAME AND THE RESULTS
                        console.table("List of Employees managed by " + answer.choice + ":", results);
                        mainMenu();
                    });
                });
        } else {
            // IN CASE WE HAVE NOT ADDED A MANAGER YET
            console.log("There are no managers to view.");
            mainMenu();
        }
    });
}

// VIEW ALL OF OUR DEPARTMENTS
function viewDept() {
    connection.query("SELECT name AS Name FROM department", function (err, results) {
        if (err) throw err;
        console.table("List of Departments:", results);
        mainMenu();
    });
}

//VIEW ALL OF THE ROLES
function viewRole() {
    connection.query("SELECT title  AS Title, salary AS Salary, department.name AS Department FROM role INNER JOIN department ON department.id = role.department_id", function (err, results) {
        if (err) throw err;
        console.table("List of Roles:", results);
        mainMenu();
    });
}

// ADDING A NEW DEPARTMENT
function addDept() {
    console.log("Adding a new Department...\n");
    // GET THE NAME OF THE NEW DEPT
    inquirer
        .prompt([
            {
                name: "name",
                type: "input",
                message: "What is name of the new department?"
            }
        ])
        .then(function (answer) {
            // INSERT THE NEW DEPT INTO THE DEPARTMENT TABLE
            connection.query(
                "INSERT INTO department SET ?",
                answer,
                function (err) {
                    if (err) throw err;
                    console.log("The new department was added!");
                    mainMenu();
                }
            );
        });
}

//ADDING A NEW ROLE
function addRole() {
    //ROLES BELONG TO DEPARTMENTS. GETTING A LIST OF DEPTS TO DISPLAY IN THE QUESTIONS
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        // MAKE SURE WE HAVE CATEGORIES IN THE SYSTEM AS THEY ARE REQUIRED FOR ROLES
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
                            // choiceArray.push("None, exit to create a new department");
                            return choiceArray;
                        },
                        message: "What department does this role belong to?"
                    }
                ])
                .then(function (answer) {
                    // if(answer.choice === "What department does this role belong to?"){mainMenu()};
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
            // IF NO DEPARTMENTS NO ROLES CAN BE CREATED
            console.log("At least one department must be created to create a role.")
            mainMenu();
        }
    });
}

// ADDING A NEW EMPLOYEE
function addEmployee() {
    // GET ALL THE ROLES SO WE CAN ASSIGN A ROLE TO OUR EMPLOYEE
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
                        // choiceArray.push("None, exit process to create a new role");
                        return choiceArray;
                    },
                    message: "What is the employee's role?"
                }
            ])
            .then(function (answer) {
                console.log(answer.choice)
                // if(answer.choice === "None, exit process to create a new role"){mainMenu();};
                // get the information of the chosen item
                for (var i = 0; i < results.length; i++) {
                    if (results[i].title === answer.choice) {
                        answer.role_id = results[i].id;
                        answer.department_id = results[i].department_id;
                    }
                }

                // GET A LIST OF MANAGERS TO ASSIGN THE EMPLOYEE TO. ONLY MANAGES THAT BELONG TO THE ROLE/DEPT ARRE DISPLAYED
                connection.query("SELECT * FROM employee WHERE manager_id IS NULL AND department_id = ?", answer.department_id, function (err, results) {
                    if (err) throw err;
                    // IF THEY CHOSE A MANAGER
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
                                        // THEY HAVE A CHOICE OF NONE SO THAT THE EMPLOYEE CAN BE A MANAGER
                                        choiceArray.push("None");
                                        return choiceArray;
                                    },
                                    message: "Who is this emmployee's manager?"
                                }
                            ])
                            .then(function (answer2) {
                                // ADD THE MANAGER ID TO THE PREVIOUS ANSWERS
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
                        // NO MANAGER SELECTED (OR AVAILABLE) SO THE EMPLOYEE IS CONSIDERED A MANAGER
                    } else {
                        console.log("No manager was added for this employee, The are a manager.");
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

//UPDATE THE EMPLOYEES ROLE
function updateRole() {
    connection.query("SELECT * FROM employee", function (err, results) {
        if (err) throw err;
        // GET A LIST OF ALL EMPLOYEES
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
                    // GET THE EMPLOYEE ID
                    let myEmpChoice;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].first_name + " " + results[i].last_name === answer.choice) {
                            myEmpChoice = results[i];
                        }
                    }
                    // GET ROLES TO SELECT FROM
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
                                //UPDATE THE ROLE AND ALSO UPDATING THE DEPT USING THE ROLE IN CASE THEY TRANSFER DEPARTMENTS
                                connection.query(
                                    "Update employee SET ? WHERE ID = ?", [{ role_id: myRoleChoice.id, department_id: myRoleChoice.department_id }, myEmpChoice.id],
                                    function (err) {
                                        if (err) throw err;
                                        console.log("The employee's role was updated!");
                                        mainMenu();
                                    }
                                );
                            });
                    })
                });
            // IF NO EMPLOYEES IN THE SYSTEM, NO ONE CAN BE UPDATED
        } else {
            console.log("No Employees are in the system, please add at least one employee.")
            mainMenu();
        }
    });
}

// UPDATE AN EMPLOYEES MANAGER
function updateManager() {
    // GETTING A LIST OF ALL EMPLOYEES THAT ARE NOT MANAGERS.
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
                    // GETTING THE LIST OF MANAGERS. CAN ONLY CHOOSE MANAGERS FROM THE EMPLOYEE'S DEPT.
                    connection.query("SELECT * FROM employee WHERE manager_id IS NULL AND department_id = ?", myEmpChoice.department_id, function (err, results) {
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
                                        "Update employee SET manager_id = ? WHERE ID = ?", [myNewManager.id, myEmpChoice.id],
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

function deleteEmployee() {
    connection.query("SELECT * FROM employee", function (err, results) {
        if (err) throw err;
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
                        message: "Which employee would you like to delete??"
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
                    // GETTING THE LIST OF MANAGERS. CAN ONLY CHOOSE MANAGERS FROM THE EMPLOYEE'S DEPT.
                    connection.query("DELETE FROM employee WHERE ID = ?", myEmpChoice.id);
                    mainMenu();
                });
        });
}