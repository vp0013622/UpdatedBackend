import express from 'express'
import { Create, GetAllProperty, GetAllNotPublishedProperty, GetAllPropertyWithParams, GetPropertyById, Edit, DeleteById, CreatePropertyImageByPropertyId, GetAllPropertyImagesByPropertyId, GetPropertyImageById, DeletePropertyImageById, DeleteAllPropertyImageById, CreatePropertyImageByPropertyIdV2, GetHomeProperties, UploadPropertyBrochure } from '../Controllers/PropertyController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'
import { AuthMiddelware } from '../Middlewares/AuthMiddelware.js'
import { MulterImageHandler } from '../Middlewares/Handlers/MulterHandler.js'
import { UploadPropertyImage, UploadPropertyBrochure as UploadPropertyBrochureMiddleware } from '../Middlewares/FileUploadMiddelware.js'
const PropertyRouter = express.Router()

PropertyRouter.post('/create', AuthMiddelware, RoleAuthMiddleware("admin", "executive"), Create)
PropertyRouter.get('/', GetAllProperty) // Public endpoint - allow viewing properties without login
PropertyRouter.get('/home', GetHomeProperties) // Public endpoint for home page
PropertyRouter.get('/notpublishedproperties', AuthMiddelware, RoleAuthMiddleware("admin"), GetAllNotPublishedProperty)
PropertyRouter.post('/withparams', GetAllPropertyWithParams)

//property images - these routes must come before the generic /:id route to avoid conflicts
PropertyRouter.post('/image/create/:id', MulterImageHandler(UploadPropertyImage.single('image')), CreatePropertyImageByPropertyId) 
PropertyRouter.post('/image/upload/:id', MulterImageHandler(UploadPropertyImage.single('image')), CreatePropertyImageByPropertyIdV2) 
PropertyRouter.get('/images/all/:id',  GetAllPropertyImagesByPropertyId)
PropertyRouter.get('/image/:id', GetPropertyImageById)
PropertyRouter.delete('/image/delete/:id', DeletePropertyImageById)
PropertyRouter.delete('/image/delete/all/:id', DeleteAllPropertyImageById)

//property brochure
PropertyRouter.post('/brochure/upload/:id', AuthMiddelware, RoleAuthMiddleware("admin", "executive"), MulterImageHandler(UploadPropertyBrochureMiddleware.single('brochure')), UploadPropertyBrochure)

// Generic routes should come last
PropertyRouter.get('/:id', GetPropertyById) // Public endpoint - allow viewing property details without login
PropertyRouter.put('/edit/:id', AuthMiddelware, RoleAuthMiddleware("admin", "executive"), Edit)
PropertyRouter.delete('/delete/:id', AuthMiddelware, RoleAuthMiddleware("admin"), DeleteById)

export default PropertyRouter