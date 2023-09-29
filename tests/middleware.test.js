import { request } from "express";
import supertest from "supertest";

describe("ValidateQueryParam testing", () => {
    it('should respond with a 400 status if teamName is not a string', async () => {
        const response = await request(app)
            .get('/nbalogos')
            .query({ teamName: 123 })
    })
})