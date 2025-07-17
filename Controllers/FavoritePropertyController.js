import * as dotenv from 'dotenv'
import { FavoritePropertyModel } from "../Models/FavoritePropertyModel.js"
dotenv.config()


const Create = async (req, res) => {
    try {
        const { userId, propertyId } = req.body
        if (!userId || !propertyId) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }
        var isExist = await FavoritePropertyModel.findOne({ userId: userId, propertyId: propertyId })
        if (isExist) {
            return res.status(400).json({
                message: 'Already added to favorite',
                data: isExist
            })
        }
        const newFavoriteProperty = {
            userId: userId,
            propertyId: propertyId,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        }
        const favoriteProperty = await FavoritePropertyModel.create(newFavoriteProperty)
        return res.status(200).json({
            message: 'favorite property added successfully',
            data: favoriteProperty
        })

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllFavoriteProperty = async (req, res) => {
    try {
        const favoriteProperty = await FavoritePropertyModel.find({ published: true });
        return res.status(200).json({
            message: 'all favorite property',
            count: favoriteProperty.length,
            data: favoriteProperty
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllFavoritePropertyByUserId = async (req, res) => {
    try {
        var { id } = req.params
        const favoriteProperty = await FavoritePropertyModel.find({ userId: id })
        return res.status(200).json({
            message: 'all favorite property by user id',
            data: favoriteProperty
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllNotPublishedFavoriteProperty = async (req, res) => {
    try {
        const favoriteProperty = await FavoritePropertyModel.find({ published: false });
        return res.status(200).json({
            message: 'all not published favorite property',
            count: favoriteProperty.length,
            data: favoriteProperty
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllFavoritePropertyWithParams = async (req, res) => {
    try {
            
        const { userId = null, propertyId = null, createdByUserId = null, updatedByUserId = null, published = null} = req.body

        let filter = {}

        if (userId !== null) {
            filter.userId = userId
        }

        if (propertyId !== null) {
            filter.propertyId = propertyId
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

        const favoriteProperty = await FavoritePropertyModel.find(filter);

        return res.status(200).json({
            message: 'all favorite property',
            count: favoriteProperty.length,
            data: favoriteProperty
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetFavoritePropertyById = async (req, res) => {
    try {
        var { id } = req.params
        const favoriteProperty = await FavoritePropertyModel.findById(id)
        if (favoriteProperty == null) {
            return res.status(404).json({
                message: 'favorite property not found',
                data: favoriteProperty
            })
        }
        return res.status(200).json({
            message: 'favorite property found',
            data: favoriteProperty
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
        const favoriteProperty = await FavoritePropertyModel.findById(id)
        if (favoriteProperty == null) {
            return res.status(404).json({
                message: 'favorite property not found',
                data: favoriteProperty
            })
        }
        const result = await FavoritePropertyModel.findByIdAndDelete(id)
        if (!result) {
            return res.status(404).json({
                message: 'favorite property not found'
            })
        }
        return res.status(201).json({
            message: 'favorite property deleted successfully'
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const DeleteByUserIdAndPropertyId = async (req, res) => {
    try {
        const { userId, propertyId } = req.body
        if (!userId || !propertyId) {
            return res.status(400).json({
                message: 'bad request: userId and propertyId are required',
                data: req.body
            })
        }
        
        const favoriteProperty = await FavoritePropertyModel.findOne({ 
            userId: userId, 
            propertyId: propertyId 
        })
        
        if (!favoriteProperty) {
            return res.status(404).json({
                message: 'favorite property not found for this user and property'
            })
        }
        
        const result = await FavoritePropertyModel.findByIdAndDelete(favoriteProperty._id)
        if (!result) {
            return res.status(404).json({
                message: 'favorite property not found'
            })
        }
        
        return res.status(200).json({
            message: 'favorite property removed successfully'
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
    Create, GetAllFavoriteProperty, GetAllFavoritePropertyByUserId, GetAllNotPublishedFavoriteProperty, GetAllFavoritePropertyWithParams, GetFavoritePropertyById, DeleteById, DeleteByUserIdAndPropertyId 
}