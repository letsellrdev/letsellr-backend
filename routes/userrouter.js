import express from 'express'
import { insertuser } from "../controller/usercontroller.js";

export const userrouter = express.Router()
userrouter.post("/adduser",insertuser)