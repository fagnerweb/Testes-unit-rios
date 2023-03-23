import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Show user profile", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
    })

    it("should be able to show a user profile by id", async () => {
        const user = await usersRepositoryInMemory.create({
            name: "Fagner",
            email: "fagner@email.com",
            password: "123",
        })

        const id = user.id as string;        

        expect(await showUserProfileUseCase.execute(id)).toHaveProperty("id")
    })

    it("should not be able to show a user profile with an invalid id", async () => {
        expect(async () => {
            await showUserProfileUseCase.execute("123")
        }).rejects.toBeInstanceOf(ShowUserProfileError)
    })
})