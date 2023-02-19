import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "../showUserProfile/ShowUserProfileError";
import { ShowUserProfileUseCase } from "../showUserProfile/ShowUserProfileUseCase";

let inMemoryUsersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfile: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfile = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("should to be able show user profile", async () => {
    const user: ICreateUserDTO = {
      name: "User Test",
      email: "usertest@email.com",
      password: "user.test",
    };

    const userCreated = await createUserUseCase.execute(user);

    const userProfile = await showUserProfile.execute(userCreated.id || "");

    expect(userProfile).toHaveProperty("id");
    expect(userProfile.email).toEqual(user.email);
  });

  it("should not to be able show an inexistent user profile", () => {
    expect(async () => {
      await showUserProfile.execute("invalid_user_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
