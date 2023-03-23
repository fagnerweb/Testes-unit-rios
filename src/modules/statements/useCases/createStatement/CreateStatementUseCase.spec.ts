import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let createStatementUseCase: CreateStatementUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        statementsRepositoryInMemory = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
    })

    it("should be able to create a statement with type deposit", async () => {
        const user = {
            name: "Fagner",
            email: "fagner@email.com",
            password: "123"
        } as ICreateUserDTO;

        const newUser = await usersRepositoryInMemory.create(user);

        enum OperationType {
            DEPOSIT = 'deposit',
            WITHDRAW = 'withdraw',
        }

        const statement = await createStatementUseCase.execute({
            user_id: newUser.id as string,
            type: OperationType.DEPOSIT,
            amount: 1000,
            description: "Deposit"
        })

        expect(statement).toHaveProperty("id");
        expect(statement.type).toEqual("deposit");
    })

    it("should be able to create a withdraw type", async () => {
        const user = {
            name: "Fagner",
            email: "fagner@email.com",
            password: "123"
        } as ICreateUserDTO;

        const newUser = await usersRepositoryInMemory.create(user);

        await createStatementUseCase.execute({
            user_id: newUser.id as string,
            type: OperationType.DEPOSIT,
            amount: 1000,
            description: "Deposit"
        })

        const statement = await createStatementUseCase.execute({
            user_id: newUser.id as string,
            type: OperationType.WITHDRAW,
            amount: 100,
            description: "withdraw 100"
        })

        expect(statement).toHaveProperty("id");
        expect(statement.type).toEqual("withdraw");
    })

    it("should not be able to create a statement with a non-existing user", async () => {
        expect(async () => {
            await createStatementUseCase.execute({
                user_id: "id-invalido",
                type: OperationType.DEPOSIT,
                amount: 1000,
                description: "Deposit"
            })
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
    })

    
    it("should not be able to withdraw without funds", async () => {
        const user = {
            name: "Fagner",
            email: "fagner@email.com",
            password: "123"
        } as ICreateUserDTO;

        const newUser = await usersRepositoryInMemory.create(user);

        await createStatementUseCase.execute({
            user_id: newUser.id as string,
            type: OperationType.DEPOSIT,
            amount: 100,
            description: "Deposit"
        })

        expect(async () => {
            await createStatementUseCase.execute({
                user_id: newUser.id as string,
                type: OperationType.WITHDRAW,
                amount: 110,
                description: "withdraw 100"
            })
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
    })
})