const express = require('express');

// Import prisma client untuk berinteraksi dengan database
const prisma = require("../prisma/client");

// Import bcrypt
const bcrypt = require("bcryptjs");


const findUsers = async(req, res) => {
    try {
        // pagination query
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const skip = (page - 1) * limit

        // pencarian parameter query
        const search = req.query.search || ''

        // mengambil data user dari database
        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: search
                }
            },
            select: {
                id: true,
                name: true,
                email: true
            },
            orderBy: {
                id: "desc"
            },
            skip: skip,
            take: limit
        })

        // menghitung total user untuk pagination
        const totalUsers = await prisma.user.count({
            where: {
                name: {
                    contains: search
                }
            }
        })

        // menghitung total halaman
        const totalPages = Math.ceil(totalUsers / limit)

        // respons send
        res.status(200).send({
            // meta untuk response json
            meta: {
                success: true,
                message: "Berhasil mengambil semua pengguna"
            },
            // get data user
            data: users,
            // pagination
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                total: totalUsers
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

const createUser = async(req, res) => {

    // hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    try {
        // insert data
        const user = await prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            }
        })

        // mengirimkan respons
        res.status(201).send({
            // meta untuk response json
            meta: {
                success: true,
                message: "Data user berhasil di tambahkan"
            },
            //data
            data: user,
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

const findUserById = async(req, res) => {
    // mendapatkan id parameter
    const { id } = req.params

    try {
        // mengambil user bedasarkan ID
        const user = await prisma.user.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        })

        // jika user tidak ada
        if (!user) {
            return res.status(404).send({
                // meta response json
                meta: {
                    success: false,
                    message: `Pengguna dengan ID: ${id} tidak ditemukan`
                }
            })
        }

        res.status(200).send({
            // meta untuk response json
            meta: {
                success: true,
                message: `Berhasil mengambil data pengguna dengan ID: ${id}`
            },
            // data
            data: user
        })
    } catch (error) {
        res.status(500).send({
            // meta untuk response json
            meta: {
                success: false,
                message: 'Terjadi kesalahan pserver'
            },
            // data
            errors: error
        })
    }
}

const updateUser = async(req, res) => {
    // get id parameter
    const { id } = req.params

    // objek data yang akan diupdate
    let userData = {
        name: req.body.name,
        email: req.body.email,
        updated_at: new Date()
    }

    try {
        // update hash password
        if (req.body.password !== "") {
            // has password
            const hashedPassword = await bcrypt.hash(req.body.password, 10)

            // tambahkan password objek data
            userData.password = hashedPassword
        }

        // update data user
        const user = await prisma.user.update({
            where: {
                id: Number(id)
            },
            data: userData
        })

        // response jika berhasil
        res.status(200).send({
            meta: {
                success: true,
                message: "Pengguna berhasil diperbarui"
            },
            data: user
        })
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

const deleteUser = async(req, res) => {
    // id dari parameter
    const { id } = req.params

    try {
        // menghapus user
        await prisma.user.delete({
            where: {
                id: Number(id)
            }
        })

        // send respons
        res.status(200).send({
            // meta untuk response json
            meta: {
                success: true,
                message: 'Data berhasil dihapus'
            }
        })
    } catch (error) {
        res.status(200).send({
            // meta untuk response json
            meta: {
                success: false,
                message: 'Terjadi kesalahan diserver'
            },
            // data error
            errors: error
        })
    }
}

module.exports = {
    findUsers,
    createUser,
    findUserById,
    updateUser,
    deleteUser
};