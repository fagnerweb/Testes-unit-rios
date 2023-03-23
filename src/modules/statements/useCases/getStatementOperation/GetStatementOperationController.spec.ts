import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database"

let connection: Connection;

describe("Show statement", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();

        await request(app).post("/api/v1/users")
        .send({
            name: "Fagner",
            email: "fagner@email.com",
            password: "123"
        })
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to deposit and withdraw value", async () => {
        const responseToken = await request(app)
        .post("/api/v1/sessions")
        .send({
            email: "fagner@email.com",
            password: "123"
        });

        const { token } = responseToken.body;

        const deposit = await request(app)
        .post("/api/v1/statements/deposit")
        .send({
            amount: 100,
            description: "Salário"
        })
        .set({
            Authorization: `Bearer ${token}`
        })

        const withdraw = await request(app)
        .post("/api/v1/statements/withdraw")
        .send({
            amount: 10,
            description: "lanche"
        })
        .set({
            Authorization: `Bearer ${token}`
        })

        expect(deposit.body).toHaveProperty("id");
        expect(deposit.body.type).toEqual("deposit");
        expect(deposit.body.amount).toBe(100);

        expect(withdraw.body).toHaveProperty("id");
        expect(withdraw.body.type).toEqual("withdraw");
        expect(withdraw.body.amount).toBe(10);
    })
})