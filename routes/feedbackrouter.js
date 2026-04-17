import express from 'express'
export const feedbackrouter = express.Router()
import { addfeedback, getfeedback, getallfeedback, deletefeedback } from '../controller/feedbackcontroller.js'
import { adminmiddle, adminOnly } from '../middleware/adminmiddleware.js'

feedbackrouter.post("/", addfeedback); // Replaces /addfeedback
feedbackrouter.get("/property/:id", getfeedback); // Replaces /getfeedbacks/:id
feedbackrouter.get("/", adminmiddle, adminOnly, getallfeedback); // Replaces /getallfeedbacks
feedbackrouter.delete("/:id", adminmiddle, adminOnly, deletefeedback); // Replaces /deletefeedback/:id

