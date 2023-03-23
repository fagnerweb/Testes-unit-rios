import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase"
import { CreateUserError } from "./CreateUserError";
let createUserUseCase: CreateUserUseCase;
let userRepositoryInMemory: InMemoryUsersRepository;

describe("Create a new User", () => {
  beforeEach(() => {
    userRepositoryInMemory = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory)
  })

  it("should able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Fagner",
      email: "fagner@email.com",
      password: "123"
    });

    expect(user).toHaveProperty("id");    
  })

  it("should able to create a new user", async () => {    
    await expect(async () => {
      await createUserUseCase.execute({
        name: "Fagner",
        email: "fagner@email.com",
        password: "123"
      });

      await createUserUseCase.execute({
        name: "Fagner",
        email: "fagner@email.com",
        password: "123"
      });
    }).rejects.toBeInstanceOf(CreateUserError)
  })

})