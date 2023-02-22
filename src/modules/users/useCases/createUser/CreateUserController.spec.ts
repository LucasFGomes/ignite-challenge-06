import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should to be able create new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "SuperTest",
      email: "supertest@email.com",
      password: "Test123",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a user with already existing email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "SuperTest",
      email: "supertest@email.com",
      password: "Test123",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "SuperTest2",
      email: "supertest@email.com",
      password: "Test1234",
    });

    expect(response.status).toBe(400);
  });
});
