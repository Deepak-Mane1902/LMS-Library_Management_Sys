import User from '../models/User.js';
import  jwt  from 'jsonwebtoken';



// To Autheticate JWT Token
export const authToken = async (req,res,next)=>{
     try {
     const authHeader = req.headers["authorization"];
     const token = authHeader && authHeader.split(" ")[1];
     if(!token){
          return res.status(401).json({
               message:"No Token Provided, Authorization Denied.."
          });
     }
     
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     const user = await User.findById(decoded.id).select("-password");
     
     if(!user){
          return res.status(401).json({
               message:"Token is invalid or User no longer exists"
          })
     }

     req.user = user;
     next();

     } catch (error) {
     console.error("JWT Auth Error",error);
     return res.status(401).json({
          message:"Token is not valid"
     })
     
     }
}
//  To Authorize Specific Role
export const  authorizeRoles = (...roles) =>{
     return (req,res,next)=>{
          if(!req.user || !roles.includes(req.user.role)){
               return res.status(403).json({
                    message:"Access Forbidden"
               });
          }
          next();
     }
}