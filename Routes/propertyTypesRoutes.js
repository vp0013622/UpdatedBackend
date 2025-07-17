import express from 'express'
import { Create, GetAllPropertyTypes, GetAllNotPublishedPropertyTypes, GetAllPropertyTypesWithParams, GetPropertyTypeById, Edit, DeleteById } from '../Controllers/PropertyTypesController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const PropertyTypesRouter = express.Router()
PropertyTypesRouter.post('/create', RoleAuthMiddleware("admin", "sales", "executive"), Create) //only admin
PropertyTypesRouter.get('/', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetAllPropertyTypes)//only for admin
PropertyTypesRouter.get('/notpublishedPropertyTypes', RoleAuthMiddleware("admin"), GetAllNotPublishedPropertyTypes)//only for admin
PropertyTypesRouter.post('/withparams', RoleAuthMiddleware("admin", "sales", "executive"), GetAllPropertyTypesWithParams)//only for admin
PropertyTypesRouter.get('/:id', RoleAuthMiddleware("admin", "sales", "executive"), GetPropertyTypeById)//only for admin
PropertyTypesRouter.put('/edit/:id', RoleAuthMiddleware("admin", "sales", "executive"), Edit)//only for admin
PropertyTypesRouter.delete('/delete/:id', RoleAuthMiddleware("admin", "sales", "executive"), DeleteById)//only for admin
export default PropertyTypesRouter