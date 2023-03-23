import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

let getStatementOperationUseCase: GetStatementOperationUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        statementsRepositoryInMemory = new InMemoryStatementsRepository();
        getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
        createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)

    })

    it("should be able to get a statement", async () => {
        const user = {
            name: "Fagner",
            email: "fagner@email.com",
            password: "123"
        } as ICreateUserDTO;

        const newUser = await usersRepositoryInMemory.create(user);

        const user_id = newUser.id as string;

        const statement = await createStatementUseCase.execute({
            user_id: newUser.id as string,
            type: OperationType.DEPOSIT,
            amount: 1000,
            description: "Deposit"
        })

        const statement_id = statement.id as string;

        const currentStatement = await getStatementOperationUseCase.execute({ user_id, statement_id})

        expect(currentStatement).toHaveProperty("id");
    })

    it("should not be able to get a statement if user does not exist", async () => {
        const user = {
            name: "Fagner",
            email: "fagner@email.com",
            password: "123"
        } as ICreateUserDTO;

        const newUser = await usersRepositoryInMemory.create(user);

        const statement = await createStatementUseCase.execute({
            user_id: newUser.id as string,
            type: OperationType.DEPOSIT,
            amount: 1000,
            description: "Deposit"
        })

        const statement_id = statement.id as string;

        expect(async () => {
            await getStatementOperationUseCase.execute({ user_id: "123", statement_id})
        }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
    })

    it("should not be able to get a statement if statement does not exist", async () => {
        const user = {
            name: "Fagner",
            email: "fagner@email.com",
            password: "123"
        } as ICreateUserDTO;

        const newUser = await usersRepositoryInMemory.create(user);

        const user_id = newUser.id as string;

        const statement = await createStatementUseCase.execute({
            user_id: newUser.id as string,
            type: OperationType.DEPOSIT,
            amount: 1000,
            description: "Deposit"
        })

        const statement_id = statement.id as string;

        expect(async () => {
            await getStatementOperationUseCase.execute({ user_id, statement_id: "123"})
        }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
    })

})