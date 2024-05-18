const express=require('express');
const app=express();
const userRoutes=require('./routes/userRoutes');
const candidateRoutes=require('./routes/candidateroutes');
const db=require('./db')
const {jwtAuthMiddleware}=require('./jwt');
require('dotenv').config();


const bodyParser=require('body-parser');
app.use(bodyParser.json());

const PORT=process.env.PORT||3000;


app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);


app.listen(PORT,()=>{
    console.log(`Listening at port${PORT}`);
});
