import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {protectedRouteStyles as s } from '../assets/dummyStyles';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({allowedRole}) => {
  
     const {currentUser, ready} = useAuth();
     const location = useLocation();

     if(!ready){
          console.log("Protected Route: Auth not ready yet");
          return (
               <div className={s.loadingContainer}>
                    <div className={s.loadingCard}>
                         Loading your library workspace
                    </div>
               </div>
          )
     }
     if(!currentUser){
          const hasToken = localStorage.getItem("library-auth-token");
          console.log("Protected Route: No currentUser. HasToken:",
                !!hasToken, "AllowRole",allowedRole);
               
          if(hasToken){
               return (
                    <div className={s.loadingContainer}>
                         <div className={s.loadingCard}>
                              Syncing your workspace...
                         </div>
                    </div>
               )
          }     
     
          return <Navigate to="/login" replace state={{from: location.pathname}} />
     }

     console.log("Protected Route: CurrentUser", 
          currentUser.role,
          "AllowedRole:",
          allowedRole
     );
     
     if(currentUser.role !== allowedRole){
          console.warn("ProtectedRoute: Role mismatch! Redirecting to login");
          return <Navigate to="/login" replace state={{from: location.pathname}} />          
     }

     console.log("ProtectedRoute: Access Granted");
     

     return <Outlet />
}

export default ProtectedRoute