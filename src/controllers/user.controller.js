 import { asyncHandler } from "../utils/asyncHandler.js"
 import { ApiError } from "../utils/apiError.js"
 import  { User } from "../models/user.model.js"
 import { ApiResponse } from "../utils/apiResponse.js"


 const genrateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken  =  user.genrateAccessToken()
        const refreshToken = user.genrateRefreshToken()

        user.refreshToken = refreshToken
        await user.save( {validateBeforSave:false})
         
        return {accessToken , refreshToken}
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating access and refresh token ")
    }
 }


 // As avatar user can only upload pdf and csv files
 const registerUser = asyncHandler(async (req , res) =>{
        // get user details from frontend
         // check if user already exist - check by email or user name 
        // check for images , check for avatar
        // uplode them to cloudinary, check avatar
        // store data in a user object
        // create entry in db
        // remove password and refresh token field
        // check for user creation
        // return user response 
            const {fullName,email,userName,password,address,number} = req.body
            console.log(fullName,email,userName,password,address,number)
        // validation - not empty
        if([fullName,email,userName,password,address,number].some((field)=>
        field?.trim()==="")
        ){
            throw new ApiError(400,"All fields are required")
        }

        const existedUser =  await User.findOne({
            $or: [{ userName },{ email }]
        })
        
        if(existedUser){
            throw new ApiError(409,"User with email and user name already exist")
        }

       const avatarLocalPath =  req.files?.avatar[0]?.path

       if(!avatarLocalPath){
        throw new ApiError(400,"Avtar file is require ")
       }


      const user = await User.create({
        fullName,
        avatar : avatarLocalPath, 
        email,
        password,
        userName: userName.toLowerCase(),
        address,
        number

       })

       const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
       )

       if(!createUser){
        throw new ApiError(500,"Something went wroung when registering the user ")
       }

       return res.status(201).json(
        new ApiResponse(200,createUser,"Uaer Registered successfully")
       )

 })

 const loginUser = asyncHandler(async (req,res)=>{
    // take username or email and password from frontend
    //check username password is correct verify password
    //if password ok prepare both token and send on coockies
    // make use login
    const {email , userName , password} = req.body
    if(!userName && !email){
        throw new ApiError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or:[{userName},{email}]
    })

    if(!user){
        throw new ApiError(404,"User dose not exist")
    }
    console.log(password,"000000000000000000000000")
    const isPasswordValid =  await user.isPasswordCorrect(password)

    if (!isPasswordValid){
        throw new ApiError(401,"invalid user credentials1")
    }

    const {accessToken , refreshToken} = await genrateAccessAndRefreshToken(user._id)

    const loggendInUser = await User.findById(user._id).
    select( "-password -refreshToken" )

    const options = {
        httpOnly : true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken ,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200, {
            user: loggendInUser , accessToken ,
            refreshToken
        },
        "User logged in Success"
    )
    )

 })

    const logoutUser = asyncHandler(async(req,res)=>{
                await User.findByIdAndUpdate(
                    req.user._id,
                    {
                        $set:{refreshToken:undefined}
                    },{
                        new:true
                    }
                )
                const options = {
                httpOnly : true,
                secure: true
                }

                return res
                .status(200)
                .clearCookie("accessToken",options)
                .clearCookie("refreshToken",options)
                .json(new ApiResponse(200,{},"user loggedOut successfully"))
    })

    const updateUserProfile = asyncHandler(async (req, res) => {
        console.log("req.body →", req.body);
console.log("req.headers['content-type'] →", req.headers['content-type']);
        const { fullName, email } = req.body
    
        if (!fullName && !email) {
            throw new ApiError(400, "Provide at least one field to update")
        }
    
        const updateData = {}
        if (fullName?.trim()) updateData.fullName = fullName
        if (email?.trim()) {
            const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } })
            if (emailExists) {
                throw new ApiError(409, "Email already in use")
            }
            updateData.email = email.toLowerCase()
        }
    
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true }
        ).select("-password -refreshToken")
    
        return res.status(200).json(
            new ApiResponse(200, updatedUser, "User profile updated successfully")
        )
    })

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatarLocalPath } },
        { new: true }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Avatar updated successfully")
    )
})




 export {registerUser , loginUser ,logoutUser , updateUserProfile , updateUserAvatar}