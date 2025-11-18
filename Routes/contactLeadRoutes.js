import express from 'express'
import { CreateFromContactUs } from '../Controllers/LeadsController.js'

const ContactLeadRouter = express.Router()
// Public endpoint for contact us form - no authentication required
ContactLeadRouter.post('/create-from-contact', CreateFromContactUs)

export default ContactLeadRouter

