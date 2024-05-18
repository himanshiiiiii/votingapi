const express=require('express');
const router=express.Router();
const bcrypt=require('bcrypt');
const User=require('../models/user');
const {jwtAuthMiddleware,generateToken}=require('../jwt');

router.post('/signup',async(req,res)=>{
  try{
    const data=req.body
    const newUser=new User(data);

    const response= await newUser.save();
    console.log(('data saved'));

    const payload={
        id:response.id
    }

    console.log(JSON.stringify(payload));
    const token=generateToken(payload);

    console.log("Token is: ",token);

    res.status(200).json({response:response,token:token});

}catch(e)
{
    console.log(e);
    res.status(500).json({error:"Internal server errror"})
}
})


//login route
router.post('/login',async(req,res)=>{
    try{
    //extract adharcardno &npassword from req.body
    const {aadharCardNumber,password}=req.body;

    //find user by adharcardno
    const user=await User.findOne({aadharCardNumber:aadharCardNumber});

    //if user doesnot exist or pass does not match return error
    if(!user||(await bcrypt.compare(password,user.password))){
        return res.status(401).json({error:'Invalid username or password'})
    }

    const payload={
        id:user.id
    }

    const token=generateToken(payload);

    console.log("Token is: ",token);
    res.json({token})




}
    catch(err){
        console.log(e);
        res.status(500).json({error:"Internal server errror"})
    }
})


 //get profile

 router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
    try {

        //first extract userdata from user.data saved in database
        const userData=req.user;
        //extract id from user data
        const userId=userData.id;
        const user=await User.findById(userId);
        res.status(200).json({user})

    } catch (e) {
        console.log(e);
        res.status(500).json({error:"Internal server errror"})
    }
 })

 //update pass
 
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extract the id from the token
        const { currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

        // Check if currentPassword and newPassword are present in the request body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

        // Find the user by userID
        const user = await User.findById(userId);

        // If user does not exist or password does not match, return error
    if(!user||(await bcrypt.compare(password,user.password))){
        return res.status(401).json({error:'Invalid username or password'})
    }
        // Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({ message: 'Password updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports=router;