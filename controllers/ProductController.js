// Import express untuk membuat server web
const express = require("express");

// Import prisma client untuk berinteraksi dengan database
const prisma = require("../prisma/client");

// Fungsi findProducts untuk mengambil daftar produk dengan paginasi

const findProduct = async(req, res) => {
    try {
        // pagination query
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const skip = (page - 1) * limit

        // pencarian parameter query
        const search = req.query.search || ''

        // mengambil data product dari database
        const products = await prisma.product.findMany({
            where: {
                title: {
                    contains: search // Mencari judul product mengandung kata kunci
                }
            },
            select: {
                id: true,
                barcode: true,
                title: true,
                image: true,
                description: true,
                buy_price: true,
                sell_price: true,
                stock: true,
                created_at: true,
                updated_at: true,
                category: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                id: "desc"
            },
            skip: skip,
            take: limit
        })

        // menghitung total product untuk pagination
        const totalProducts = await prisma.product.count({
            where: {
                title: {
                    contains: search // Menghitung jumlah total produk yang sesuai dengan kata kunci pencarian
                }
            }
        })

        // menghitung total halaman
        const totalPages = Math.ceil(totalProducts / limit)

        // respons send
        res.status(200).send({
            // meta untuk response json
            meta: {
                success: true,
                message: "Berhasil mengambil data product"
            },
            // get data categori
            data: products,
            // pagination
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                total: totalProducts
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

const createProduct = async(req, res) => {

    try {
        // Insert new product
        const product = await prisma.product.create({
            data: {
                barcode: req.body.barcode,
                title: req.body.title,
                description: req.body.description,
                buy_price: parseInt(req.body.buy_price),
                sell_price: parseInt(req.body.sell_price),
                stock: parseInt(req.body.stock),
                image: req.file.path,
                category_id: parseInt(req.body.category_id),
            },
            include: {
                category: true
            }
        })

        // mengirimkan respons
        res.status(201).send({
            // meta untuk response json
            meta: {
                success: true,
                message: "Data product berhasil di tambahkan"
            },
            //data
            data: product,
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
    findProduct,
    createProduct
}