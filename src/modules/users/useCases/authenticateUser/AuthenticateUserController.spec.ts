import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("Test1234", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password) VALUES ('${id}', 'AuthTest', 'authtest@email.com', '${password}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should to be able an authenticate user existent", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "authtest@email.com",
      password: "Test1234",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
