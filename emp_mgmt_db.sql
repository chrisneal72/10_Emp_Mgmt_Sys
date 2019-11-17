DROP DATABASE IF EXISTS emp_mgmt_db;

CREATE DATABASE emp_mgmt_db;

USE emp_mgmt_db;

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30) NULL,
  salary DECIMAL(10,2) NULL,
  department_id INT NULL
);


CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NULL
);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NULL,
  last_name VARCHAR(30) NULL,
  role_id INT NOT NULL,
  manager_id INT,
  department_id INT NOT NULL,
  FOREIGN KEY(role_id) REFERENCES role(id),
  FOREIGN KEY(department_id) REFERENCES department(id),
  FOREIGN KEY(manager_id) REFERENCES employee(id)
);
