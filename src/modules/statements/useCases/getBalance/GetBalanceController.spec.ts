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

    it("should be able to show  balance by user", async () => {
        const responseToken = await request(app)
        .post("/api/v1/sessions")
        .send({
            email: "fagner@email.com",
            password: "123"
        });

        const { token } = responseToken.body;

        const statement = await request(app)
        .post("/api/v1/statements/deposit")
        .send({
            amount: 100,
            description: "Salário"
        })
        .set({
            Authorization: `Bearer ${token}`
        })

        const response = await request(app)
        .get(`/api/v1/statements/${statement.body.id}`)
        .send()
        .set({
            Authorization: `Bearer ${token}`
        })
    
        expect(response.body).toHaveProperty("id");
        expect(response.body.amount).toBe("100.00");
    })
})