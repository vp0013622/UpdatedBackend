import express from 'express'
import { Create, GetAllUserProfilePicture, GetAllUserProfilePictureWithParams, GetUserProfilePictureById, Edit, DeleteById } from '../Controllers/UserProfilePictureController.js'
import { UploadProfilePicture } from '../Middlewares/FileUploadMiddelware.js'
import { MulterImageHandler, MulterFileHandler } from '../Middlewares/Handlers/MulterHandler.js'

const UserProfilePictureRouter = express.Router() //for docs -> MulterFileHandler(uploadDocument.single('document'))
UserProfilePictureRouter.post('/create', MulterImageHandler(UploadProfilePicture.single('profile')), Create) //only admin
UserProfilePictureRouter.get('/',  GetAllUserProfilePicture)//only for admin
UserProfilePictureRouter.post('/withparams', GetAllUserProfilePictureWithParams)//only for admin
UserProfilePictureRouter.get('/:id', GetUserProfilePictureById)//only for admin
UserProfilePictureRouter.put('/edit/:id', MulterImageHandler(UploadProfilePicture.single('profile')), Edit)//only for admin
UserProfilePictureRouter.delete('/delete/:id', DeleteById)//only for admin
export default UserProfilePictureRouter