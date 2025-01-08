const express = require('express');

// Import prisma client untuk berinteraksi dengan database
const prisma = require("../prisma/client");

// Import fs
const fs = require("fs");

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
                total: totalCategories,
                perPage: limit,
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

const findCategoryById = async(req, res) => {
    const { id } = req.params;

    try {
        // ambil category id
        const category = await prisma.category.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                name: true,
                image: true,
                description: true,
                created_at: true,
                updated_at: true,
            }
        })

        // jika category tidak ada
        if (!category) {
            return res.status(404).send({
                // meta response json
                meta: {
                    success: false,
                    message: `Kategori dengan ID: ${id} tidak ditemukan`
                }
            })
        }

        res.status(200).send({
            // meta untuk response json
            meta: {
                success: true,
                message: `Berhasil mengambil data kategori dengan ID: ${id}`
            },
            // data
            data: category
        })
    } catch (error) {
        res.status(500).send({
            // meta untuk response json
            meta: {
                success: false,
                message: 'Terjadi kesalahan server'
            },
            // data
            errors: error
        })
    }
}

const updateCategory = async(req, res) => {
    // get id parameter
    const { id } = req.params

    try {
        // update kategori dengan gambar atau tanpa gmabar
        const dataCategory = {
            name: req.body.name,
            description: req.body.description,
            updated_at: new Date()
        }

        // Cek apakah ada gambar yang diupload
        if (req.file) {

            // Assign gambar ke data kategori
            dataCategory.image = req.file.path;

            // get category by id
            const category = await prisma.category.findUnique({
                where: {
                    id: Number(id),
                },
            });

            // Cek jika ada file gambar
            if (category.image) {

                // Hapus gambar lama
                fs.unlinkSync(category.image);
            }
        }

        // Lakukan update data kategori
        const category = await prisma.category.update({
            where: {
                id: Number(id),
            },
            data: dataCategory,
        });

        // Kirim respons
        res.status(200).send({
            // meta untuk respons dalam format JSON
            meta: {
                success: true,
                message: "Kategori berhasil diperbarui",
            },
            // data kategori yang diperbarui
            data: category,
        });
    } catch (error) {
        // response jika error
        res.status(500).send({
            meta: {
                success: false,
                message: "Terjadi kesalahan server"
            },
            errors: error
        })
    }
}

// Fungsi deleteCategory
const deleteCategory = async(req, res) => {
    // Ambil ID dari parameter URL
    const { id } = req.params;

    try {
        // Ambil kategori yang akan dihapus
        const category = await prisma.category.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!category) {
            // Jika kategori tidak ditemukan, kirim respons 404
            return res.status(404).send({
                // meta untuk respons dalam format JSON
                meta: {
                    success: false,
                    message: `Kategori dengan ID: ${id} tidak ditemukan`,
                },
            });
        }

        // Hapus kategori dari database
        await prisma.category.delete({
            where: {
                id: Number(id),
            },
        });

        // Hapus gambar dari folder uploads jika ada
        if (category.image) {
            const imagePath = category.image;
            const fileName = imagePath.substring(imagePath.lastIndexOf("/") + 1);
            const filePath = `uploads/${fileName}`;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Kirim respons
        res.status(200).send({
            // meta untuk respons dalam format JSON
            meta: {
                success: true,
                message: "Kategori berhasil dihapus",
            },
        });
    } catch (error) {
        // Jika terjadi kesalahan, kirim respons kesalahan internal server
        res.status(500).send({
            // meta untuk respons dalam format JSON
            meta: {
                success: false,
                message: "Terjadi kesalahan di server",
            },
            // data kesalahan
            errors: error,
        });
    }
};

// Fungsi allCategories
const allCategories = async(req, res) => {
    try {
        // Ambil kategori 
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                image: true,
                description: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: {
                id: "desc",
            }
        });

        // Kirim respons
        res.status(200).send({
            // Meta untuk respons dalam format JSON
            meta: {
                success: true,
                message: "Berhasil mendapatkan semua kategori",
            },
            // Data kategori
            data: categories,
        });
    } catch (error) {
        // Jika terjadi kesalahan, kirim respons kesalahan internal server
        res.status(500).send({
            // Meta untuk respons dalam format JSON
            meta: {
                success: false,
                message: "Terjadi kesalahan di server",
            },
            // Data kesalahan
            errors: error,
        });
    }
};



module.exports = {
    findCategories,
    createCategory,
    findCategoryById,
    updateCategory,
    deleteCategory,
    allCategories
};