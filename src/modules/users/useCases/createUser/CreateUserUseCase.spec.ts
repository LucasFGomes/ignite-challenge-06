import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should to be able create new user", async () => {
    const user = {
      name: "User test",
      email: "userteste@email.com",
      password: "Test1234",
    };
    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const userCreated = await inMemoryUsersRepository.findByEmail(user.email);

    expect(userCreated).toHaveProperty("id");
  });

  it("should not to be able create new user with email exists", async () => {
    expect(async () => {
      const user = {
        name: "User test",
        email: "userteste@email.com",
        password: "Test1234",
      };
      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password,
      });
      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password,
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
