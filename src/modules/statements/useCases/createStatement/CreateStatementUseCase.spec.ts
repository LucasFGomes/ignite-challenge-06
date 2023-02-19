import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUsersRepository: IUsersRepository;
let inMemoryStatementsRepository: IStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should to be able create new statement", async () => {
    const userCreated = await createUserUseCase.execute({
      name: "User Test",
      email: "usertest@email.com",
      password: "Test1234",
    });

    const statement: ICreateStatementDTO = {
      user_id: userCreated.id || "",
      type: "deposit" as OperationType,
      description: "description test",
      amount: 15.5,
    };

    const statementCreated = await createStatementUseCase.execute(statement);

    expect(statementCreated).toHaveProperty("id");
  });

  it("should not to be able create new statement an inexistent user", async () => {
    expect(async () => {
      const statement: ICreateStatementDTO = {
        user_id: "user_id_inexistent",
        type: "deposit" as OperationType,
        description: "description test",
        amount: 15.5,
      };
      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should to be able to decrease the requested amount on the balance", async () => {
    const userCreated = await createUserUseCase.execute({
      name: "User Test",
      email: "usertest@email.com",
      password: "Test1234",
    });

    const user_id = userCreated.id || "";

    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      description: "description test",
      amount: 100,
    });

    await createStatementUseCase.execute({
      user_id,
      type: "withdraw" as OperationType,
      description: "description test",
      amount: 50,
    });

    const { balance } = await getBalanceUseCase.execute({
      user_id,
    });

    expect(balance).toBe(50);
  });

  it("should not be able to decrease value when balance is zero", async () => {
    expect(async () => {
      const userCreated = await createUserUseCase.execute({
        name: "User Test",
        email: "usertest@email.com",
        password: "Test1234",
      });

      const user_id = userCreated.id || "";

      await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as OperationType,
        description: "description test",
        amount: 50,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
