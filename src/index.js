import express, { json } from "express";
import { v4 } from "uuid";

const app = express();
const port = 3000;

app.use(json());
const customers = [];

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

app.get("/statement", (req, res) => {
  const { cpf } = req.headers;

  const customerRef = customers.find((customer) => customer.cpf === cpf);

  if (!customerRef) {
    return res.status(400).json({ error: "Customer not found!" });
  }

  return res.json(customerRef.statement);
});

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
