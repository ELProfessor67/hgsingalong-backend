import express from 'express'
import { config } from 'dotenv'
import { createClerkClient } from '@clerk/backend';
import { getUserByEmail } from './utils/basicMethons.js';


config({path: '.env'});
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.post('/api/v1/login',async (req,res) => {
    try {
        const {email,password} = req.body;
        const users = await clerkClient.users.getUserList({emailAddress: [email]});
        const user  = getUserByEmail(users.data,email)
        if(!user){
            res.status(401).json({
                success: false,
                message: "Invalid Details"
            });
            return
        }

        try {
            const response = await clerkClient.users.verifyPassword({
                userId: user.id,
                password: password
            });
            if(response.verified){

               

                res.status(201).json({
                    success: true,
                    message: `Welcome Back ${user?.firstName}`,
                    user_id: user.id,
                    email,
                    name: user.firstName
                })
            }
        } catch (error) {
            console.log(error.message)
            res.status(401).json({
                success: false,
                message: "Invalid Details"
            });
            return
        }

        
        

    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message
        })
    }
})


app.post('/api/v1/register',async (req,res) => {
    try {
        const {name,email,password} = req.body

        if(!name || !email || !password){
            res.status(401).json({
                success: false,
                message: "All fields are required"
            });
            return
        }
        const users = await clerkClient.users.getUserList({emailAddress: [email]});
     
        const isExist = getUserByEmail(users.data,email)

        if(isExist){
            res.status(401).json({
                success: false,
                message: "User Already Exist"
            });
            return
        }

        
        const user = await clerkClient.users.createUser({
            firstName: name,
            lastName: '',
            emailAddress: [ email ],
            password
        })


        res.status(201).json({
            success: true,
            message: `Welcome ${user?.firstName}`,
            user_id: user.id,
            email,
            name: user.firstName
        })

        
        

    } catch (error) {
        res.status(501).json({
            success: false,
            message: 'password too weak please make strong password.'
        })
    }
})






app.post('/api/v1/verify-login-otp', async (req, res) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({ success: false, message: "User ID and OTP are required" });
        }

        // Verify OTP
        const response = await clerkClient.users.attemptEmailAddressVerification({ userId, code });

        if (response.verified) {
            return res.status(200).json({
                success: true,
                message: "Login successful!",
                user_id: userId
            });
        } else {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "OTP verification failed." });
    }
});


app.post('/api/v1/resend-login-otp', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        await clerkClient.users.createEmailAddressVerification({ userId });

        return res.status(200).json({ success: true, message: "OTP has been resent." });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to resend OTP." });
    }
});



app.post('/api/v1/login-by-email',async (req,res) => {
    try {
        const {email,name} = req.body
        console.log('sss')
        if(!email){
            res.status(401).json({
                success: false,
                message: "All fields are required"
            });
            return
        }
        const users = await clerkClient.users.getUserList({emailAddress: email});
   
        const user  = getUserByEmail(users.data,email)
        console.log(user)
        if(user){
            res.status(201).json({
                success: true,
                message: `Welcome Back ${user?.firstName}`,
                user_id: user.id,
                email,
                name: user.firstName
            })
        }else{
            const user = await clerkClient.users.createUser({
                firstName: name,
                lastName: '',
                emailAddress: [ email ],
                skipPasswordRequirement: true
            })
            res.status(201).json({
                success: true,
                message: `Welcome Back ${user?.firstName}`,
                user_id: user.id,
                email,
                name: user.firstName
            })
        }
        
        
        

    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message
        })
    }
})





const PORT = process.env.PORT || 4000;
app.listen(PORT,() => {
    console.log(`server listing on port ${PORT}`)
})