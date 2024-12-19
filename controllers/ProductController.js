// Import express untuk membuat server web
const express = require("express");

// Import prisma client untuk berinteraksi dengan database
const prisma = require("../prisma/client");

// Import fs
const fs = require("fs");

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

// Fungsi findProductById untuk mengambil produk berdasarkan ID
const findProductById = async(req, res) => {
    // Mengambil ID dari parameter
    const { id } = req.params;

    try {
        // Mengambil produk berdasarkan ID
        const product = await prisma.product.findUnique({
            where: {
                id: Number(id),
            },
            select: {
                id: true,
                barcode: true,
                title: true,
                description: true,
                buy_price: true,
                sell_price: true,
                stock: true,
                image: true,
                category_id: true,
                created_at: true,
                updated_at: true,
                category: {
                    select: {
                        name: true,
                        description: true,
                        image: true,
                        created_at: true,
                        updated_at: true,
                    },
                },
            }
        });

        if (!product) {
            return res.status(404).send({
                //meta untuk respons JSON
                meta: {
                    success: false,
                    message: `Produk dengan ID: ${id} tidak ditemukan`,
                },
            });
        }

        // Mengirim respons
        res.status(200).send({
            //meta untuk respons JSON
            meta: {
                success: true,
                message: `Berhasil mengambil produk dengan ID: ${id}`,
            },
            //data produk
            data: product,
        });

    } catch (error) {
        // Mengirim respons jika terjadi kesalahan
        res.status(500).send({
            //meta untuk respons JSON
            meta: {
                success: false,
                message: "Kesalahan internal server",
            },
            //data kesalahan
            errors: error,
        });
    }
};

const updateProduct = async(req, res) => {

    const { id } = req.params

    try {
        const dataProduct = {
            barcode: req.body.barcode,
            title: req.body.title,
            description: req.body.description,
            buy_price: parseInt(req.body.buy_price),
            sell_price: parseInt(req.body.sell_price),
            stock: parseInt(req.body.stock),
            category_id: parseInt(req.body.category_id),
            updated_at: new Date(),
        }

        // cek apakah ada file
        if (req.file) {
            // Mengassign gambar ke object data produk
            dataProduct.image = req.file.path;

            // get product by id
            const product = await prisma.product.findUnique({
                where: {
                    id: Number(id),
                },
            });
            if (product.image) {

                // Menghapus gambar lama
                fs.unlinkSync(product.image);
            }
        }

        // Mengupdate produk
        const product = await prisma.product.update({
            where: {
                id: Number(id),
            },
            data: dataProduct,
            include: {
                category: true,
            }
        });

        // Mengirim respons
        res.status(200).send({
            //meta untuk respons JSON
            meta: {
                success: true,
                message: "Produk berhasil diperbarui",
            },
            //data produk
            data: product,
        });
    } catch (error) {
        // Mengirim respons jika terjadi kesalahan
        res.status(500).send({
            //meta untuk respons JSON
            meta: {
                success: false,
                message: "Kesalahan internal server",
            },
            //data kesalahan
            errors: error,
        });
    }
}

const deleteProduct = async(req, res) => {

    const { id } = req.params

    try {
        // Mengambil produk yang akan dihapus
        const product = await prisma.product.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!product) {
            return res.status(404).send({
                //meta untuk respons JSON
                meta: {
                    success: false,
                    message: `Produk dengan ID: ${id} tidak ditemukan`,
                },
            });
        }

        // Menghapus produk
        await prisma.product.delete({
            where: {
                id: Number(id),
            },
        });

        // Menghapus gambar dari folder uploads jika ada
        if (product.image) {
            const imagePath = product.image;
            const fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
            const filePath = `uploads/${fileName}`;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Mengirim respons
        res.status(200).send({
            //meta untuk respons JSON
            meta: {
                success: true,
                message: "Produk berhasil dihapus",
            },
        });
    } catch (error) {
        // Mengirim respons jika terjadi kesalahan
        res.status(500).send({
            //meta untuk respons JSON
            meta: {
                success: false,
                message: "Kesalahan internal server",
            },
            //data kesalahan
            errors: error,
        });
    }

}

const findProductByCategoryId = async(req, res) => {
    // Mengambil ID dari parameter
    const { id } = req.params;

    try {
        // Mengambil nilai halaman dan limit dari parameter query, dengan nilai default
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        // Mengambil produk berdasarkan category ID
        const products = await prisma.product.findMany({
            where: {
                category_id: Number(id),
            },
            select: {
                id: true,
                barcode: true,
                title: true,
                description: true,
                buy_price: true,
                sell_price: true,
                stock: true,
                image: true,
                category_id: true,
                created_at: true,
                updated_at: true,
            },
            skip: skip,
            take: limit,
        });

        // Mengambil jumlah total produk untuk paginasi
        const totalProducts = await prisma.product.count({
            where: {
                category_id: Number(id), // Hitung produk berdasarkan category ID
            },
        });

        // Menghitung total halaman
        const totalPages = Math.ceil(totalProducts / limit);

        // Mengirim respons
        res.status(200).send({
            meta: {
                success: true,
                message: `Berhasil mengambil produk dengan category ID: ${id}`,
            },
            data: products,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                perPage: limit,
                total: totalProducts,
            },
        });
    } catch (error) {
        // Mengirim respons jika terjadi kesalahan
        res.status(500).send({
            meta: {
                success: false,
                message: "Kesalahan internal server",
            },
            errors: error,
        });
    }
}

// Fungsi findProductByBarcode untuk mengambil produk berdasarkan barcode
const findProductByBarcode = async(req, res) => {

    try {
        // Mengambil produk berdasarkan barcode
        const product = await prisma.product.findMany({
            where: {
                barcode: req.body.barcode,
            },
            select: {
                id: true,
                barcode: true,
                title: true,
                description: true,
                buy_price: true,
                sell_price: true,
                stock: true,
                image: true,
                category_id: true,
                created_at: true,
                updated_at: true,
                category: {
                    select: {
                        name: true,
                        description: true,
                        image: true,
                        created_at: true,
                        updated_at: true,
                    },
                },
            }
        });

        if (!product) {
            return res.status(404).send({
                //meta untuk respons JSON
                meta: {
                    success: false,
                    message: `Produk dengan barcode: ${req.body.barcode} tidak ditemukan`,
                },
            });
        }

        // Mengirim respons
        res.status(200).send({
            //meta untuk respons JSON
            meta: {
                success: true,
                message: `Berhasil mengambil produk dengan barcode: ${req.body.barcode}`,
            },
            //data produk
            data: product,
        });

    } catch (error) {
        // Mengirim respons jika terjadi kesalahan
        res.status(500).send({
            //meta untuk respons JSON
            meta: {
                success: false,
                message: "Kesalahan internal server",
            },
            //data kesalahan
            errors: error,
        });
    }
};

module.exports = {
    findProduct,
    createProduct,
    findProductById,
    updateProduct,
    deleteProduct,
    findProductByCategoryId,
    findProductByBarcode
}