import express from 'express'
export const feedbackrouter = express.Router()
import { addfeedback, getfeedback, getallfeedback, deletefeedback } from '../controller/feedbackcontroller.js'
import { adminmiddle } from '../middleware/adminmiddleware.js'

feedbackrouter.post("/", addfeedback); // Replaces /addfeedback
feedbackrouter.get("/property/:id", getfeedback); // Replaces /getfeedbacks/:id
feedbackrouter.use('/', adminmiddle);
feedbackrouter.get("/", getallfeedback); // Replaces /getallfeedbacks
feedbackrouter.delete("/:id", deletefeedback); // Replaces /deletefeedback/:id

