import * as dotenv from 'dotenv'
import { RolesModel } from "../Models/RolesModel.js"
dotenv.config()


const Create = async (req, res) => {
    try {
        const { name, description } = req.body
        if (!name) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }
        const newRole = {
            name: name.toUpperCase(),
            description: description || "",
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        }
        const role = await RolesModel.create(newRole)
        return res.status(200).json({
            message: 'role added successfully',
            data: role
        })

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllRoles = async (req, res) => {
    try {
        const roles = await RolesModel.find({ published: true });
        return res.status(200).json({
            message: 'all roles',
            count: roles.length,
            data: roles
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllNotPublishedRoles = async (req, res) => {
    try {
        const roles = await RolesModel.find({ published: false });
        return res.status(200).json({
            message: 'all not published roles',
            count: roles.length,
            data: roles
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllRolesWithParams = async (req, res) => {
    try {

        const { name = null, createdByUserId = null, updatedByUserId = null, published = null} = req.body

        let filter = {}

        if (name !== null) {
            filter.name = { $regex: name, $options: "i" }
        }

        if (createdByUserId !== null) {
            filter.createdByUserId = createdByUserId
        }

        if (updatedByUserId !== null) {
            filter.updatedByUserId = updatedByUserId
        }

        if (published !== null) {
            filter.published = published;
        }

        const roles = await RolesModel.find(filter);

        return res.status(200).json({
            message: 'all roles',
            count: roles.length,
            data: roles
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetRoleById = async (req, res) => {
    try {
        var { id } = req.params
        const role = await RolesModel.findById(id)
        if (role == null) {
            return res.status(404).json({
                message: 'role not found',
                data: role
            })
        }
        return res.status(200).json({
            message: 'role found',
            data: role
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const Edit = async (req, res) => {
    try {
        const { name, description} = req.body
        if (!name) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }
        var { id } = req.params
        const role = await RolesModel.findById(id)
        if (!role) {
            return res.status(404).json({
                message: 'role not found'
            })
        }

        const newRole = {
            name: name.toUpperCase(),
            description: description || "",
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        }
        
        const result = await RolesModel.findByIdAndUpdate(id, newRole)
        if (!result) {
            return res.status(404).json({
                message: 'role not found'
            })
        }
        return res.status(201).json({
            message: 'role updated successfully'
        })
        

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const DeleteById = async (req, res) => {
    try {
        var { id } = req.params
        const role = await RolesModel.findById(id)
        if (role == null) {
            return res.status(404).json({
                message: 'role not found',
                data: role
            })
        }
        role.updatedByUserId = req.user.id
        role.published = false
        const result = await RolesModel.findByIdAndUpdate(id, role)
        if (!result) {
            return res.status(404).json({
                message: 'role not found'
            })
        }
        return res.status(201).json({
            message: 'role deleted successfully'
        })
        

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

export { 
    Create, GetAllRoles, GetAllNotPublishedRoles, GetAllRolesWithParams, GetRoleById, Edit, DeleteById
}