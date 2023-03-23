import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let getBalanceUseCase: GetBalanceUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let userRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Get balance", () => {
    beforeEach(() => {
        statementsRepositoryInMemory = new InMemoryStatementsRepository();
        userRepositoryInMemory = new InMemoryUsersRepository();
        getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, userRepositoryInMemory)
        createStatementUseCase = new CreateStatementUseCase(userRepositoryInMemory, statementsRepositoryInMemory);
    })

    it("should be able to get balance", async () => {
        const user = {
            name: "Fagner",
            email: "fagner@email.com",
            password: "123"
        } as ICreateUserDTO;

        const newUser = await userRepositoryInMemory.create(user);

        const id = newUser.id as string;

        await createStatementUseCase.execute({
            user_id: newUser.id as string,
            type: OperationType.DEPOSIT,
            amount: 100,
            description: "Deposit"
        })

        const balance = await getBalanceUseCase.execute({ user_id: id });

        expect(balance.statement[0]).toHaveProperty("id");
        expect(balance.statement[0].amount).toEqual(100);
        expect(balance.balance).toEqual(100);
    })

    it("hould not be able to retrieve balance if user does not exist", async () => {
        const user = {
            name: "Fagner",
            email: "fagner@email.com",
            password: "123"
        } as ICreateUserDTO;

        const newUser = await userRepositoryInMemory.create(user);

        const id = newUser.id as string;

        await createStatementUseCase.execute({
            user_id: newUser.id as string,
            type: OperationType.DEPOSIT,
            amount: 100,
            description: "Deposit"
        })

        expect(async () => {
            await getBalanceUseCase.execute({ user_id: "123" })
        }).rejects.toBeInstanceOf(GetBalanceError)

    })
})