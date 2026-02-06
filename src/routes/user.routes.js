import { Router } from "express";
import { loginUser, logoutUser, registerUser, updateUserAvatar, updateUserProfile } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount :1
        },
    ]),
    registerUser)

router.route("/login").post(loginUser)

    //secured routes
router.route("/logoutUser").post(verifyJwt,logoutUser)
router.route("/update-profile").patch(verifyJwt, updateUserProfile)
router.route("/update-avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)


export default router;