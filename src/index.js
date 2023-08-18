import express, { json, response } from "express";
import { v4 } from "uuid";

const app = express();
const port = 3000;

app.use(json());

const verifyIfExistsAccountCPF = (req, res, next) => {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return res.status(400).json({ error: "Customer not found!" });
  }

  req.customer = customer;

  return next();
};

const getBalance = (statement) => {
  //Retorna o
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
};

const customers = [];

app.get("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  return json(customer);
});

app.post("/account", (req, res) => {
  const { cpf, name } = req.body;
  const id = v4();

  //Verifica se já existe o CPF
  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return res.status(400).json({ error: "Customer already exists! " });
  }

  customers.push({
    cpf,
    name,
    id,
    statement: [],
  });

  return res.status(201).json(req.body);
});

app.put("/account", (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res.status(201).json({ message: "Account name change successful" });
});

app.get("/allAccounts", (req, res) => {
  if (customers.length === 0) {
    return res.json({ message: "Not have customers!" });
  }
  return res.json(customers);
});

app.delete("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;

  customers.splice(customer, 1);

  return res
    .status(204)
    .json({ message: "Customer deleted successful", customers });
});

app.get("/statement", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  return res.json(customer.statement);
});

app.get("/statement/date", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter((statement) => {
    return (
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
    );
  });

  return res.json(statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { description, amount } = req.body;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return res.status(201).json({ message: "Successful deposit" });
});

app.post("/withdraw", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { amount } = req.body;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return res.status(400).json({ error: "Insfficient funds!" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return res.status(201).json({ message: "Successful withdraw!" });
});

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
