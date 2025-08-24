import { UsersModel } from "../Models/UsersModel.js"
import bcrypt from "bcryptjs"
import * as dotenv from 'dotenv'
import { emailRegex, phoneRegex, SALT } from "../config.js"
import { RolesModel } from "../Models/RolesModel.js"
dotenv.config()


const Register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phoneNumber, role } = req.body
        if (!email || !password || !firstName || !lastName || !role) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }
        const isEmailValidationTrue = emailRegex.test(email);
        if (!isEmailValidationTrue) {
            return res.status(401).json({
                message: 'email is not valid',
                data: req.body
            })
        }

        const isPhoneNumberValidationTrue = phoneRegex.test(phoneNumber);
        if (!isPhoneNumberValidationTrue) {
            return res.status(401).json({
                message: 'phone number is not valid',
                data: req.body
            })
        }

        const roleData = await RolesModel.findById(role)
        const hashedPassword = await bcrypt.hash(password, SALT);
        const newUser = {
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            role: roleData._id,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        }
        const user = await UsersModel.create(newUser)
        user.password = ""
        return res.status(200).json({
            message: 'user added successfully',
            data: user
        })

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllUsers = async (req, res) => {
    try {
        const users = await UsersModel.find({ published: true })
            .sort({ createdAt: -1 })
        return res.status(200).json({
            message: 'all users',
            count: users.length,
            data: users
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllNotPublishedUsers = async (req, res) => {
    try {
        const users = await UsersModel.find({ published: false })
            .sort({ createdAt: -1 });
        return res.status(200).json({
            message: 'all not published users',
            count: users.length,
            data: users
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllUsersWithParams = async (req, res) => {
    try {
        const { email = null, firstName = null, lastName = null, phoneNumber = null, roleId = null, published = null } = req.body
        let filter = {}

        if (email !== null) {
            filter.email = { $regex: email, $options: "i" }
        }
        if (firstName !== null) {
            filter.firstName = { $regex: firstName, $options: "i" }
        }
        if (lastName !== null) {
            filter.lastName = { $regex: lastName, $options: "i" }
        }
        if (phoneNumber !== null) {
            filter.phoneNumber = { $regex: phoneNumber, $options: "i" }
        }
        if (roleId !== null) {
            filter.role = roleId
        }
        if (published !== null) {
            filter.published = published
        }

        const users = await UsersModel.find(filter)
            .sort({ createdAt: -1 })

        return res.status(200).json({
            message: 'all users',
            count: users.length,
            data: users
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetUserById = async (req, res) => {
    try {
        var { id } = req.params
        const user = await UsersModel.findById(id)
        if (user == null) {
            return res.status(404).json({
                message: 'user not found',
                data: user
            })
        }
        return res.status(200).json({
            message: 'user found',
            data: user
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
        const { email, firstName, lastName, phoneNumber, password = null, role, published = true } = req.body
        if (!email || !firstName || !lastName || !role) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }
        const isEmailValidationTrue = emailRegex.test(email);
        if (!isEmailValidationTrue) {
            return res.status(401).json({
                message: 'email is not valid',
                data: req.body
            })
        }

        const isPhoneNumberValidationTrue = phoneRegex.test(phoneNumber);
        if (!isPhoneNumberValidationTrue) {
            return res.status(401).json({
                message: 'phone number is not valid',
                data: req.body
            })
        }

        var { id } = req.params
        //const hashedPassword = await bcrypt.hash(password, SALT)
        const user = await UsersModel.findById(id)
        if (!user) {
            return res.status(404).json({
                message: 'user not found'
            })
        }

        const roleData = await RolesModel.findById(role)
        const hashedPassword =  password != null && password != '' ? await bcrypt.hash(password, SALT) : null;
        const newUser = {
            email: email,
            password: hashedPassword != null ? hashedPassword : user.password,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            role: roleData._id,
            createdByUserId: user.createdByUserId,
            updatedByUserId: req.user.id,
            published: published
        }
        
        const result = await UsersModel.findByIdAndUpdate(id, newUser)
        if (!result) {
            return res.status(404).json({
                message: 'user not found'
            })
        }
        return res.status(201).json({
            message: 'user updated successfully'
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
        const user = await UsersModel.findById(id)
        if (user == null) {
            return res.status(404).json({
                message: 'user not found',
                data: user
            })
        }
        user.updatedByUserId = req.user.id;
        user.published = false
        const result = await UsersModel.findByIdAndUpdate(id, user)
        if (!result) {
            return res.status(404).json({
                message: 'user not found'
            })
        }
        return res.status(201).json({
            message: 'user deleted successfully'
        })
        

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const ChangePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        const userId = req.user.id // Get user ID from authenticated token

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Current password and new password are required',
                data: req.body
            })
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'New password must be at least 6 characters long',
                data: req.body
            })
        }

        // Find the user
        const user = await UsersModel.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                message: 'Current password is incorrect'
            })
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, SALT)

        // Update the password
        const updatedUser = await UsersModel.findByIdAndUpdate(
            userId,
            { 
                password: hashedNewPassword,
                updatedByUserId: userId
            },
            { new: true }
        )

        // Don't send password in response
        updatedUser.password = ""

        return res.status(200).json({
            message: 'Password changed successfully',
            data: updatedUser
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
    Register,
    GetAllUsers,
    GetAllNotPublishedUsers,
    GetAllUsersWithParams,
    GetUserById,
    Edit,
    DeleteById,
    ChangePassword
}