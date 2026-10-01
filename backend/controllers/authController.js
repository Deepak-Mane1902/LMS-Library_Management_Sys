import User from '../models/User.js';
import {generate} from 'otp-generator';
import sendOtp from '../utils/sendOtp.js';
import bcrypt from 'bcryptjs';
import {v4 as uuidv4} from 'uuid';
import jwt from 'jsonwebtoken'; 

// step: 1 register user and send otp
export  async function registerUser(req,res){
     try {
          const { name, email, phone, password} = req.body;
          if(!email){
               return res.status(400).json({
                    message:"Email is required.."
               });
          }

                    
          const cleanPhone = phone ? phone.toString().replace(/\D/g, "") : "";
          if(cleanPhone.length !== 10){
               return res.status(400).json({
                    message:"Mobile number must be exactly of 10 digits "
               });
          }

const existingUser = await User.findOne({ email });

if (existingUser && existingUser.isVerified) {
     return res.status(400).json({
          message: "User already exists"
     });
}

if (existingUser && !existingUser.isVerified) {
     await User.deleteOne({ email });
}

          const otp = generate(6,{upperCaseAlphabets: false,lowerCaseAlphabets:false,specialChars:false})

          // to send Otp to email 
          try {
          
               await sendOtp(email,otp);
          } catch (emailError) {
               console.error("Error while sending Otp..", emailError);
               return res.status(500).json({
                    message:"Failed to send OTP to email, please try again... "
               });
          }

          const hashPassword = await bcrypt.hash(password, 10);
          const otpExpiry = new Date(Date.now() + 5*60*1000);
          const studentId = `ST-${uuidv4().slice(0,8).toUpperCase()}`;

          // Create User 
          const user = await User.create({
               name,
               email,
               phone: cleanPhone,
               password:hashPassword,
               otp,
               otpExpiry,
               studentId,
          });
          res.status(201).json({
               message:"User registered Successfully, OTP sent to email",user
          });

     } catch (error) {
          console.error("Failed to registering user :",error);
          res.status(500).json({
               message:"Error registering user",
               error:error.message
          })
     }
}
// Step: 2 Verify the OTP
export async function verifyOtp(req,res){
     try {
     const {email,otp} = req.body;
     if(!email){
          return res.status(400).json({
               message:"Email is required."
          });
     }

     const user = await User.findOne({email});
     if(!user){
          return res.status(404).json({
               message:"User not Found"
          });
     }

     if(user.otp !== otp || new Date() > new Date(user.otpExpiry)){
          return res.status(400).json({
               message:"Invalid or Expired OTP"
          });
     }

     Object.assign(user, {isVerified:true, otp:null, otpExpiry:null });
     await user.save();
     res.status(200).json({
          message:"OTP verified successfully"
     });

     } catch (error) {
        console.error("Error verifying OTP", error);
        res.status(500).json({
          message:"Error while verifying OTP",
          error:error.message
        });         
     }
}
// Step: 3 Complete Profile
export async function completeProfile(req,res){
     try {
          const {email,department, stream, semester, year, rollNo} = req.body;
          if(!email){
               return res.status(400).json({
                    message:"Email is required"
               });
          }

     const user = await User.findOne({email});
     if(!user){
          return res.status(404).json({
               message:"User not Found"
          });
     }
     if(!user.isVerified){
          return  res.status(400).json({
               message:"User is not Verified"
          });
     }
     Object.assign(user,{department,stream,semester,year,rollNo,isProfileComplete: true});
     await user.save();
     res.status(200).json({
          message:"Profile Complete Successfully.."
     });
     
     } catch (error) {
          console.error("Failed to Complete User Profile :",error);
          res.status(500).json({
               message:"Error while Completing user profile..",
               error:error.message
          });
          
     }
}
// Step:4 Login as a Student
export async function loginUser(req,res){
     try {
          
     const {email,password} = req.body;
     if(!email || !password){
          return res.status(400).json({
               success:false,
               message:"Email and Password is required"
          });
     }
     const user = await User.findOne({email});
     if(!user){
          return res.status(404).json({
               success:false,
               message:"User not Found"
          });
     }
     if(!user.isVerified){
          return  res.status(403).json({
               success:false,
               message:"please verify your email with Otp before logIn"
          });
     }
     if(!(await bcrypt.compare(password,user.password))){
          return res.status(400).json({
               success:false,
               message:"Invalid credentials"
          })
     }

     const token = jwt.sign({id: user._id, role:user.role}, process.env.JWT_SECRET,{expiresIn:"7d"});

     const {password: _, ...userResponse} = user.toObject();
     res.status(200).json({
          success:true,
          token,
          user:userResponse
     });
     } catch (error) {
          console.error("Error during logIn",error);
          res.status(500).json({
               success:false,
               message:error.message
          });
     }
}
// Step:5 Get Current User Profile
export async function getProfile(req,res){
     try {
          const user = await User.findById(req.user.id).select("-password");
          if(!user){
               return res.status(404).json({
                    message:"User Not Found"
               });
          }
          res.status(200).json({success:true, user});


     } catch (error) {
          console.error("Error Fetching User Profile",error);
          res.status(500).json({
               message:"Error Fetching User Profile",
               error:error.message
          });
     }
}
// Step:6 Update User Profile
export async function updateProfile(req, res) {
  try {
    const { name, email, phone, department, stream, semester, academicYear, rollNumber } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== user.email.toLowerCase()) {
        if (user.role === "user") {
          return res.status(400).json({ message: "Students are not allowed to change their email address" });
        }
        if (await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } })) {
          return res.status(400).json({ message: "Email already in use" });
        }
        user.email = normalizedEmail;
      }
    }
    if (phone) {
      const cleanPhone = phone.toString().replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
      }
      user.phone = cleanPhone;
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (stream) user.stream = stream;
    if (semester) user.semester = semester;
    if (academicYear) user.year = academicYear;
    if (rollNumber) user.rollNo = rollNumber;

    await user.save();
    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
}
// Step:7 Get all Students Account (Admin)
export async function getusers(req,res){
     try {
      const users = await User.find({role:"user",isVerified:true,isProfileComplete:true}).select("-password");
      res.status(200).json({
          success:true,
          users
      })
     } catch (error) {
    console.error("Error Fetching Students:", error);
    res.status(500).json({ message: "Error Fetching Students", error: error.message });
     }
}
// Step:8 Admin Registration 
export async function registerAdmin(req,res){
     try {
     const {name,email,phone,password} = req.body;
     if(!name || !email || !phone || !password ){
          return res.status(400).json({
               message:"Please enter all required fields"
          });
     }       
     
     if(await User.findOne({email})){
          return res.status(404).json({
               message:"User already exists with the same email"
          });
     }

     const hashPassword = await bcrypt.hash(password,10);
     const user = await User.create({
          name,
          email:email.trim().toLowerCase(),
          phone,
          password:hashPassword,
          role:"admin",
          isVerified:true
     });
     
     const {password: _, ...userResponse} = user.toObject();
     res.status(201).json({
          success:true,
          message:"Admin registered Successfully",
          user: userResponse
     })
     } catch (error) {
    console.error("Error Registering Admin:", error);
    res.status(500).json({ message: "Error Registering Admin", error: error.message });
     }
}