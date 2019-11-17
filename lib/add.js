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

module.exports = {
    addDept,
    addRole,
    addEmployee
 }