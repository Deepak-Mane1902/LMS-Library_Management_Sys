import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from './shared/ProtectedRoute';
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminBookPage from "./admin/AdminBookPage";
import AdminUserPage from "./admin/AdminUserPage";
import AdminFinePage from "./admin/AdminFinePage";
import UserLayout from "./user/UserLayout";
import UserDashboard from "./user/UserDashboard";
import UserBook from "./user/UserBook";
import UserEdit from "./user/UserEdit";

const App = () => {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />

        {/* Protected Routes */}
        {/* Admin */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route path="/admin" element={<AdminLayout/>}> 
        <Route index element={<Navigate to="/admin/dashboard" replace  />} />
        <Route path="dashboard" element={<AdminDashboard/>} />
        <Route path="books" element={<AdminBookPage/>} />
        <Route path="users" element={<AdminUserPage/>} />
        <Route path="fines" element={<AdminFinePage/>} />
        </Route>
        </Route>

        {/* Protected Routes */}
        {/* User */}
        <Route element={<ProtectedRoute allowedRole="user" />}>
        <Route path="/user" element={<UserLayout/>}> 
        <Route index element={<Navigate to="/user/dashboard" replace  />} />
        <Route path="dashboard" element={<UserDashboard/>} />
        <Route path="books" element={<UserBook/>} />
        <Route path="profile" element={<UserEdit/>} />
        </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}

export default App