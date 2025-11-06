import express from 'express'
import { Create, GetAllPropertyTypes, GetAllNotPublishedPropertyTypes, GetAllPropertyTypesWithParams, GetPropertyTypeById, Edit, DeleteById } from '../Controllers/PropertyTypesController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'
import { AuthMiddelware } from '../Middlewares/AuthMiddelware.js'

const PropertyTypesRouter = express.Router()
PropertyTypesRouter.post('/create', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive"), Create) //only admin
PropertyTypesRouter.get('/', GetAllPropertyTypes) // Public endpoint - accessible to everyone
PropertyTypesRouter.get('/notpublishedPropertyTypes', AuthMiddelware, RoleAuthMiddleware("admin"), GetAllNotPublishedPropertyTypes)//only for admin
PropertyTypesRouter.post('/withparams', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive"), GetAllPropertyTypesWithParams)//only for admin
PropertyTypesRouter.get('/:id', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive"), GetPropertyTypeById)//only for admin
PropertyTypesRouter.put('/edit/:id', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive"), Edit)//only for admin
PropertyTypesRouter.delete('/delete/:id', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive"), DeleteById)//only for admin
export default PropertyTypesRouter