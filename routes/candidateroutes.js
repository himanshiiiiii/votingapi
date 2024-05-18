const express=require('express');
const router=express.Router();
const bcrypt=require('bcrypt');
const Candidate=require('../models/candidate');
const User=require('../models/user');
const {jwtAuthMiddleware,generateToken}=require('../jwt');
  


const checkAdminRole=async(userId)=>{
    try {
        const user=await User.findById(userId);
        if(user.role==='admin')
        return true ;
    } catch (error) {
        return false;
    }
}

//POSt route to add a candidate
router.post('/',jwtAuthMiddleware,async(req,res)=>{
  try{

    if(!await checkAdminRole(req.user.id))
        return res.status(403).json({message:"User is not an admin"});
    const data=req.body// assumming the req body contains the candidate data

    //create a new candidate
    const newCandidate=new Candidate(data);

    const response= await newCandidate.save();
    console.log(('data saved'));

    res.status(200).json({response:response});

}catch(e)
{
    console.log(e);
    res.status(500).json({error:"Internal server errror"})
}
})



 //update existing electorte
 router.put('/:candidateId',jwtAuthMiddleware,async(req,res)=>{
    try {
        if(!await checkAdminRole(req.user.id))
            return res.status(403).json({message:"User is not an admin"});
        const candidateId=req.params.id;
        const updatedcandidateData=req.body;
        const response=await Candidate.findByIdAndUpdate(candidateId,updatedcandidateData,{
            new:true,
            runValidators:true,
        })

        if(!response)return res.status(404).json({error:'Candidate not found'});
        console.log("Candidate data updated");
        res.status(200).json(response)
    } catch (e) {
        console.log(e);
        res.status(500).json({error:"Internal server errror"})
    }
 })

 //delete data
 router.delete('/:candidateId',jwtAuthMiddleware,async(req,res)=>{
    try {
        if(!await checkAdminRole(req.user.id))
            return res.status(403).json({message:"User is not an admin"});
        const candidateId=req.params.id;
        const response=await Candidate.findByIdAndDelete(candidateId)

        if(!response)return res.status(404).json({error:'Candidate not found'});
        console.log("Candidate data deleted");
        res.status(200).json(response)
    } catch (e) {
        console.log(e);
        res.status(500).json({error:"Internal server errror"})
    }
 })

 //start voting
 router.post('/votes/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    //no admin can vote
    //user can only vote once

    candidateID=req.params.candidateID;
    userID=req.user.id;
    try {
const candidate =await Candidate.findById(candidateID);
if(!candidate)return res.status(404).json({message:"Canidate not found"})
    const user = await User.findById(userID);
if(!user)return res.status(404).json({message:"User not found"})

        if(user.role==='admin')
            return res.status(404).json({error:"Admin cannot vote"});
        if(user.isVoted==true)
            return res.status(404).json({error:"You have already voted"});
        
        //update the candidate document
        candidate.votes.push({user:userID});
        candidate.voteCount++;
      await candidate.save();

      //update user document
      user.isVoted=true,
      await user.save();

      res.status(200).json({message:"Vote recorded sucessfully"});

    } catch (err) {
        console.log(err);
        res.status(500).json({error:"Internal server errror"})
    }
 })

 //vote count
 router.get('/vote/count',async(req,res)=>{
    try {
        const candidate =await Candidate.find().sort({voteCount:'desc'});
       
          //map the candidate to return only there name and voteCount
          const voteRecord=candidate.map((data)=>{
            return{
                party:data.party,
                count:data.voteCount,
            }
          });
          return res.status(200).json(voteRecord)

    } catch (err) {
        console.log(err);
        res.status(500).json({error:"Internal server errror"})   
    }
 })

module.exports=router;