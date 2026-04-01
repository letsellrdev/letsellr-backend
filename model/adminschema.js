import mongoose from 'mongoose'
const schema = mongoose.Schema;
const model = new schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        
        require:true
    },
    password:{
        type:String,
        require:true
    }
})
const admin = mongoose.model("admin",model,"admin");
export default admin;