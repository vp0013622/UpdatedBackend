import express from 'express'
import { Create, GetAllFavoriteProperty, GetAllFavoritePropertyByUserId, GetAllNotPublishedFavoriteProperty, GetAllFavoritePropertyWithParams, GetFavoritePropertyById, DeleteById, DeleteByUserIdAndPropertyId } from '../Controllers/FavoritePropertyController.js'

const FavoritePropertyRouter = express.Router()
FavoritePropertyRouter.post('/create',  Create)     
FavoritePropertyRouter.get('/', GetAllFavoriteProperty)
FavoritePropertyRouter.get('/user/:id', GetAllFavoritePropertyByUserId)
FavoritePropertyRouter.get('/notpublishedfavoriteproperty', GetAllNotPublishedFavoriteProperty)
FavoritePropertyRouter.post('/withparams',  GetAllFavoritePropertyWithParams)
FavoritePropertyRouter.get('/:id', GetFavoritePropertyById)
FavoritePropertyRouter.delete('/delete/:id', DeleteById)
FavoritePropertyRouter.delete('/delete', DeleteByUserIdAndPropertyId)
export default FavoritePropertyRouter