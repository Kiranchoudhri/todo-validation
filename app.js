const express = require("express");
const path = require("path");
const { format, isValid } = require("date-fns");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// app.get("/todos", async (request, response) => {
//   const getTodosQuery = `
//     SELECT
//       *
//     FROM
//       todo;`;
//   const todoArray = await db.all(getTodosQuery);
//   response.send(todoArray);
// });

app.get("/todos/", async (request, response) => {
  const requestObject = request.query;
  const { category, priority, status, search_q } = requestObject;
  console.log(request.query);
  console.log(Object.keys(requestObject).length);

  const queryLength = Object.keys(requestObject).length;
  if (queryLength === 1) {
    const queryTitle = Object.keys(requestObject)[0];
    if (queryTitle == "search_q") {
      const { search_q } = requestObject;
      const getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE 
            todo LIKE "%${search_q}%";`;
      const todoArray = await db.all(getTodosQuery);
      response.send(todoArray);
    } else {
      // new code
      if (queryTitle == "category") {
        const isCategoryValid =
          category === "WORK" || category === "HOME" || category === "LEARNING";
        if (!isCategoryValid) {
          response.status(400);
          response.send("Invalid Todo Category");
        } else {
          const getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE 
            ${queryTitle} = "${requestObject[queryTitle]}";`;
          console.log(getTodosQuery);
          const todoArray = await db.all(getTodosQuery);
          response.send(todoArray);
        }
      } else if (queryTitle == "priority") {
        const isPriorityValid =
          priority === "LOW" || priority === "MEDIUM" || priority === "HIGH";
        if (!isPriorityValid) {
          response.status(400);
          response.send("Invalid Todo Priority");
        } else {
          const getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE 
            ${queryTitle} = "${requestObject[queryTitle]}";`;
          console.log(getTodosQuery);
          const todoArray = await db.all(getTodosQuery);
          response.send(todoArray);
        }
      } else if (queryTitle == "status") {
        const isStatusValid =
          status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
        if (!isStatusValid) {
          response.status(400);
          response.send("Invalid Todo Status");
        } else {
          const getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE 
            ${queryTitle} = "${requestObject[queryTitle]}";`;
          console.log(getTodosQuery);
          const todoArray = await db.all(getTodosQuery);
          response.send(todoArray);
        }
      }
      //   else if (queryTitle == "dueDate") {
      //     const toDateFormat = new Date(requestObject[queryTitle]);
      //     const isDateValid = isValid(toDateFormat);
      //     if (!isDateValid) {
      //       response.status(400);
      //       response.send("Invalid Due Date");
      //     } else {
      //       const getTodosQuery = `
      //         SELECT
      //         *
      //         FROM
      //         todo
      //         WHERE
      //         ${queryTitle} = "${requestObject[queryTitle]}";`;
      //       console.log(getTodosQuery);
      //       const todoArray = await db.all(getTodosQuery);
      //       response.send(todoArray);
      //     }
      //   }
    }
  } else {
    querysTitle = Object.keys(requestObject);
    const isCategoryValid =
      category === "WORK" || category === "HOME" || category === "LEARNING";
    const isPriorityValid =
      priority === "LOW" || priority === "MEDIUM" || priority === "HIGH";
    const isStatusValid =
      status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
    if (querysTitle[0] == "category" && querysTitle[1] == "priority") {
      const { category, priority } = requestObject;

      if (isCategoryValid && isPriorityValid) {
        const getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE 
            category =  "${category}"
            AND priority = "${priority}";`;
        console.log(getTodosQuery);
        const todoArray = await db.all(getTodosQuery);
        response.send(todoArray);
      } else if (!isCategoryValid) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else if (!isPriorityValid) {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else if (querysTitle[0] == "priority" && querysTitle[1] == "status") {
      const { status, priority } = requestObject;
      if (isStatusValid && isPriorityValid) {
        const getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE 
            status =  "${status}"
            AND priority = "${priority}";`;
        const todoArray = await db.all(getTodosQuery);
        response.send(todoArray);
      } else if (!isStatusValid) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (!isPriorityValid) {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else {
      const { status, category } = requestObject;
      if (isCategoryValid && isStatusValid) {
        const getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE 
            status =  "${status}"
            AND category = "${category}";`;
        console.log(getTodosQuery);
        const todoArray = await db.all(getTodosQuery);
        response.send(todoArray);
      } else if (!isStatusValid) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (!isCategoryValid) {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    }
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodosQuery = `
    SELECT
      *
    FROM
      todo
      WHERE 
      id = ${todoId};`;
  const todoIDArray = await db.get(getTodosQuery);
  response.send(todoIDArray);
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const toDateFormat = new Date(date);
  const checkDate = isValid(toDateFormat);
  const modifiedDate =
    checkDate && format(new Date(toDateFormat), "yyyy-MM-dd");
  console.log(modifiedDate);
  if (checkDate) {
    const getTodosQuery = `
    SELECT
      *
    FROM
      todo
      WHERE 
      due_date = "${modifiedDate}";`;
    console.log(getTodosQuery);
    const todoArray = await db.all(getTodosQuery);
    response.send(todoArray);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { category, priority, status, todo, dueDate, id } = request.body;
  const isCategoryValid =
    category === "WORK" || category === "HOME" || category === "LEARNING";
  const isPriorityValid =
    priority === "LOW" || priority === "MEDIUM" || priority === "HIGH";
  const isStatusValid =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  const toDateFormat = new Date(dueDate);

  const isDateValid = isValid(new Date(toDateFormat));

  const modifiedDate =
    isDateValid && format(new Date(toDateFormat), "yyyy-MM-dd");
  console.log(dueDate);
  console.log(modifiedDate);
  const checkValidity =
    isCategoryValid && isPriorityValid && isStatusValid && isDateValid;

  if (checkValidity) {
    const postTodosQuery = `
        INSERT INTO
        todo (id, category, priority, status, todo, due_date)
        VALUES (
           ${id}, "${category}", "${priority}", "${status}", "${todo}", "${dueDate}"
        );`;
    const dbResponse = await db.run(postTodosQuery);

    response.send("Todo Successfully Added");
  } else {
    response.status(400);
    if (!isCategoryValid) {
      response.send("Invalid Todo Category");
    } else if (!isPriorityValid) {
      response.send("Invalid Todo Priority");
    } else if (!isStatusValid) {
      response.send("Invalid Todo Status");
    } else {
      response.send("Invalid Due Date");
    }
  }
});

app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  console.log(request.body);
  const title = Object.keys(request.body)[0];
  console.log(title);
  console.log(title == "dueDate");
  if (title == "category") {
    const { category } = request.body;
    const isCategoryValid =
      category === "WORK" || category === "HOME" || category === "LEARNING";
    if (isCategoryValid) {
      const updateTodosQuery = `
        UPDATE todo
        SET category = "${category}"    
        WHERE id = ${todoId};`;
      await db.run(updateTodosQuery);
      response.send(`Category Updated`);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (title == "priority") {
    const { priority } = request.body;
    const isPriorityValid =
      priority === "LOW" || priority === "MEDIUM" || priority === "HIGH";
    if (isPriorityValid) {
      const updateTodosQuery = `
        UPDATE todo
        SET priority = "${priority}"
        WHERE id = ${todoId};`;
      console.log(updateTodosQuery);
      await db.run(updateTodosQuery);
      response.send(`Priority Updated`);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (title == "status") {
    const { status } = request.body;
    console.log(status);
    const isStatusValid =
      status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
    if (isStatusValid) {
      const updateTodosQuery = `
        UPDATE todo
        SET status = "${status}"
        WHERE id = ${todoId};`;
      await db.run(updateTodosQuery);
      response.send(`Status Updated`);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (title == "todo") {
    const { todo } = request.body;
    const updateTodosQuery = `
        UPDATE todo
        SET todo = "${todo}"
        WHERE id = ${todoId};`;
    await db.run(updateTodosQuery);
    response.send(`Todo Updated`);
  } else {
    const { dueDate } = request.body;
    const toDateFormat = new Date(dueDate);
    console.log(toDateFormat);
    const isDateValid = isValid(toDateFormat);
    if (isDateValid) {
      const updateTodosQuery = `
        UPDATE todo
        SET due_date = "${dueDate}" 
        WHERE id = ${todoId};`;
      await db.run(updateTodosQuery);
      response.send(`Due Date Updated`);
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodosQuery = `
    DELETE FROM todo
      WHERE 
      id = ${todoId};`;
  await db.get(deleteTodosQuery);
  response.send("Todo Deleted");
});

module.exports = app;
