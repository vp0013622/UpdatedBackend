import * as dotenv from 'dotenv'
import { UserAddressModel } from "../Models/UserAddressModel.js"
dotenv.config()


const Create = async (req, res) => {
    try {
        const { userId, street = "NA", area, city, state, zipOrPinCode, country, location} = req.body
        if (!userId || !area || !city || !state || !zipOrPinCode || !country || !country || !location) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }
        const newUserAddress = {
            userId: userId,
            street: street || "",
            area: area,
            city: city,
            state: state,
            zipOrPinCode: zipOrPinCode,
            country: country,
            location: location,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        }
        const userAddress = await UserAddressModel.create(newUserAddress)
        return res.status(200).json({
            message: 'userAddress added successfully',
            data: userAddress
        })

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllUserAddress = async (req, res) => {
    try {
        const userAddress = await UserAddressModel.find({ published: true });
        return res.status(200).json({
            message: 'all userAddress',
            count: userAddress.length,
            data: userAddress
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllNotPublishedUserAddress = async (req, res) => {
    try {
        const userAddress = await UserAddressModel.find({ published: false });
        return res.status(200).json({
            message: 'all not published userAddress',
            count: userAddress.length,
            data: userAddress
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllUserAddressWithParams = async (req, res) => {
    try {

        const { area = null, city = null, state = null, zipOrPinCode = null, country = null, createdByUserId = null, updatedByUserId = null, published = null} = req.body

        let filter = {}

        if (area !== null) {
            filter.area = { $regex: area, $options: "i" }
        }

        if (city !== null) {
            filter.city = { $regex: city, $options: "i" }
        }

        if (state !== null) {
            filter.state = { $regex: state, $options: "i" }
        }

        if (zipOrPinCode !== null) {
            filter.zipOrPinCode = { $regex: zipOrPinCode, $options: "i" }
        }
        
        if (country !== null) {
            filter.country = { $regex: country, $options: "i" }
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

        const userAddress = await UserAddressModel.find(filter);

        return res.status(200).json({
            message: 'all userAddress',
            count: userAddress.length,
            data: userAddress
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetUserAddressById = async (req, res) => {
    try {
        var { id } = req.params
        const userAddress = await UserAddressModel.findById(id)
        if (userAddress == null) {
            return res.status(404).json({
                message: 'userAddress not found',
                data: userAddress
            })
        }
        return res.status(200).json({
            message: 'userAddress found',
            data: userAddress
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetUserAddressByUserId = async (req, res) => {
    try {
        var { id } = req.params
        const userAddress = await UserAddressModel.find({userId: id})
        if (userAddress == null) {
            return res.status(404).json({
                message: 'userAddress not found',
                data: userAddress
            })
        }
        return res.status(200).json({
            message: 'user Address found',
            data: userAddress
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
        const { userId, street = "NA", area, city, state, zipOrPinCode, country, location} = req.body
        if (!userId || !area || !city || !state || !zipOrPinCode || !country || !country || !location) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }
        var { id } = req.params
        const userAddress = await UserAddressModel.findById(id)
        if (!userAddress) {
            return res.status(404).json({
                message: 'user Address not found'
            })
        }

        const newUserAddress = {
            userId: userId,
            street: street,
            area: area,
            city: city,
            state: state,
            zipOrPinCode: zipOrPinCode,
            country: country,
            location: location,
            createdByUserId: userAddress.createdByUserId,
            updatedByUserId: req.user.id,
            published: true
        }
        
        const result = await UserAddressModel.findByIdAndUpdate(id, newUserAddress)
        if (!result) {
            return res.status(404).json({
                message: 'userAddress not found'
            })
        }
        return res.status(201).json({
            message: 'userAddress updated successfully'
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
        const userAddress = await UserAddressModel.findById(id)
        if (userAddress == null) {
            return res.status(404).json({
                message: 'userAddress not found',
                data: userAddress
            })
        }
        userAddress.updatedByUserId = req.user.id
        userAddress.published = false
        const result = await UserAddressModel.findByIdAndUpdate(id, userAddress)
        if (!result) {
            return res.status(404).json({
                message: 'userAddress not found'
            })
        }
        return res.status(201).json({
            message: 'userAddress deleted successfully'
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
    Create, GetAllUserAddress, GetAllNotPublishedUserAddress, GetAllUserAddressWithParams, GetUserAddressById, GetUserAddressByUserId, Edit, DeleteById
}