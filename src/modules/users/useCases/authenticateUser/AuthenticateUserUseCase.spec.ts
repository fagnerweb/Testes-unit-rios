import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate user", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory)
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    })

    it("should be able to authenticate an user", async () => {
        const user: ICreateUserDTO = {
            name: "Fagner",
            email: "fagner@email.com",
            password: "123"
        };

        await createUserUseCase.execute(user);

        const result = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        })

        expect(result).toHaveProperty("token");
    })

    it("should be not able to authenticate an noexistent user", async () => {
        expect(async () => {
            await authenticateUserUseCase.execute({
                email: "null@null.com",
                password: "null"
            })
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
    })

    it("should not be able to authenticate an incorrect password", async () => {
        const user: ICreateUserDTO = {
            name: "Fagner",
            email: "fagner@email.com",
            password: "123"
        };

        await createUserUseCase.execute(user);

        expect(async () => {
            await authenticateUserUseCase.execute({
                email: user.email,
                password: "1234"
            })
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
    })
})