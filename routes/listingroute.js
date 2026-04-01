import express from 'express';
import { categorylist, propertylist } from '../controller/listingcontroller.js'
const route = express.Router();

route.get('/allcategory', categorylist);
route.get('/allproperty', propertylist);


export default route;