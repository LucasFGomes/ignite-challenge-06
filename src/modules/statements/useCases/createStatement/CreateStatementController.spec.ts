import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
let token: string;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("Test1234", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password) VALUES ('${id}', 'UserTest', 'usertest@email.com', '${password}')`
    );

    token = await authenticateUser();
  });

  beforeEach(async () => {
    await connection.query("TRUNCATE TABLE statements");
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  const authenticateUser = async (): Promise<string> => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "usertest@email.com",
      password: "Test1234",
    });

    return responseToken.body.token;
  };

  const createStatement = async (
    amount: number,
    description: string,
    type: string
  ) => {
    const response = await request(app)
      .post(`/api/v1/statements/${type}`)
      .send({
        amount,
        description,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    return response;
  };

  it("should to be able create new statement deposit", async () => {
    const response = await createStatement(
      100,
      "Deposit Description",
      "deposit"
    );
    expect(response.status).toBe(201);
  });

  it("should to be able to decrease the requested amount on the balance", async () => {
    await createStatement(100, "Deposit Description", "deposit");
    await createStatement(50, "Withdraw Description", "withdraw");

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("balance");
    expect(response.body.balance).toBe(50);
  });

  it("should not be able to decrease value when balance is zero", async () => {
    const response = await createStatement(
      50,
      "Withdraw Description",
      "withdraw"
    );
    expect(response.status).toBe(400);
  });
});
