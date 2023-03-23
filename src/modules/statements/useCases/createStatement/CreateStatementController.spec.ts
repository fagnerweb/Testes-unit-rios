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

        const id = uuidV4();
        const password = await hash("desafio", 8);

        await connection.query(`
        INSERT INTO users(id, name, email, password, created_at, updated_at)
        values('${id}', 'desafio', 'admin@desafio.com', '${password}', 'now()', 'now()')
        `);
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to show statement by user", async () => {
        const responseToken = await request(app)
        .post("/api/v1/sessions")
        .send({
            email: "admin@desafio.com",
            password: "desafio"
        });

        const { token } = responseToken.body;

        await request(app)
        .post("/api/v1/statements/deposit")
        .send({
            amount: 100,
            description: "Salário"
        })
        .set({
            Authorization: `Bearer ${token}`
        })

        const response = await request(app)
        .get("/api/v1/statements/balance")
        .send()
        .set({
            Authorization: `Bearer ${token}`
        })
    
        expect(response.body.statement[0]).toHaveProperty("id");
        expect(response.body.statement[0].type).toEqual("deposit");
        expect(response.body.balance).toBe(100);
    })
})