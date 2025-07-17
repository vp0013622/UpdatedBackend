import express from 'express'
import { Create, GetAllProperty, GetAllNotPublishedProperty, GetAllPropertyWithParams, GetPropertyById, Edit, DeleteById, CreatePropertyImageByPropertyId, GetAllPropertyImagesByPropertyId, GetPropertyImageById, DeletePropertyImageById, DeleteAllPropertyImageById } from '../Controllers/PropertyController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'
import { MulterImageHandler } from '../Middlewares/Handlers/MulterHandler.js'
import { UploadPropertyImage } from '../Middlewares/FileUploadMiddelware.js'
const PropertyRouter = express.Router()

PropertyRouter.post('/create',  RoleAuthMiddleware("admin", "executive"), Create)
PropertyRouter.get('/',  RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"),  GetAllProperty)
PropertyRouter.get('/notpublishedproperties', RoleAuthMiddleware("admin"), GetAllNotPublishedProperty)
PropertyRouter.post('/withparams', RoleAuthMiddleware("admin","executive"), GetAllPropertyWithParams)

//property images - these routes must come before the generic /:id route to avoid conflicts
PropertyRouter.post('/image/create/:id', MulterImageHandler(UploadPropertyImage.single('image')), CreatePropertyImageByPropertyId) 
PropertyRouter.get('/images/all/:id',  GetAllPropertyImagesByPropertyId)
PropertyRouter.get('/image/:id', GetPropertyImageById)
PropertyRouter.delete('/image/delete/:id', DeletePropertyImageById)
PropertyRouter.delete('/image/delete/all/:id', DeleteAllPropertyImageById)

// Generic routes should come last
PropertyRouter.get('/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetPropertyById)
PropertyRouter.put('/edit/:id', RoleAuthMiddleware("admin", "executive"), Edit)
PropertyRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), DeleteById)

export default PropertyRouter