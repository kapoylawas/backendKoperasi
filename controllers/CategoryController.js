const express = require('express');

// Import prisma client untuk berinteraksi dengan database
const prisma = require("../prisma/client");

const findCategories = async(req, res) => {
    try {
        // pagination query
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const skip = (page - 1) * limit

        // pencarian parameter query
        const search = req.query.search || ''

        // mengambil data categories dari database
        const categories = await prisma.category.findMany({
            where: {
                name: {
                    contains: search
                }
            },
            select: {
                id: true,
                name: true,
                image: true,
                description: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: {
                id: "desc"
            },
            skip: skip,
            take: limit
        })

        // menghitung total categories untuk pagination
        const totalCategories = await prisma.category.count({
            where: {
                name: {
                    contains: search
                }
            }
        })

        // menghitung total halaman
        const totalPages = Math.ceil(totalCategories / limit)

        // respons send
        res.status(200).send({
            // meta untuk response json
            meta: {
                success: true,
                message: "Berhasil mengambil data category"
            },
            // get data categori
            data: categories,
            // pagination
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                total: totalCategories
            },
        });
    } catch (error) {
        res.status(500).send({
            // meta untuk response json
            meta: {
                success: false,
                message: "terjadi kesalahan di server"
            },
            // data errors
            errors: error
        })
    }
}

const createCategory = async(req, res) => {
    try {
        // insert data kategori baru
        const category = await prisma.category.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                image: req.file.path,
            }
        })

        // mengirimkan respons
        res.status(201).send({
            // meta untuk response json
            meta: {
                success: true,
                message: "Data kategori berhasil di tambahkan"
            },
            //data
            data: category,
        })
    } catch (error) {
        res.status(500).send({
            // meta untuk response json
            meta: {
                success: false,
                message: "Terjadi kesalahan server"
            },
            // data error
            errors: error,
        })
    }
}

module.exports = {
    findCategories,
    createCategory
};