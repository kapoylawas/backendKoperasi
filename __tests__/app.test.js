const request = require('supertest');
const express = require('express');
const app = require('../routes'); // Ganti dengan path ke file utama aplikasi Anda

describe('API Routes', () => {
    // Uji rute login
    describe('POST /login', () => {
        it('should respond with a 200 status code for valid login', async() => {
            const response = await request(app)
                .post('/login')
                .send({ username: 'admin@gmail.com', password: 'password' }); // Ganti dengan data yang sesuai
            expect(response.statusCode).toBe(200);
        });
    });
});