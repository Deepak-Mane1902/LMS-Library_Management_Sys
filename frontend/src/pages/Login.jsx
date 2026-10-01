import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { loginStyles as s } from "../assets/dummyStyles";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../shared/AuthContext";

import { useState } from "react";

const roleChoices = [
  {
    value: "user",
    label: "Student",
    icon: UserRound,
  },
  {
    value: "admin",
    label: "Admin",
    icon: ShieldCheck,
  },
];

const Login = () => {
  const {login} = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Get signup data directly from location.state
  const [form, setForm] = useState({
    email: location.state?.signupEmail ?? "",
    password: location.state?.signupPassword ?? "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setloading] = useState(false);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // To submit the data to server and get the user/admin logged in
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setloading(true);

    try {
      console.log("Attempting login with:", {
        email: form.email,
        role: form.role,
      });

      const result = await login(form);

      console.log("Login result:", result);

      // Login failed
      if (!result) {
        setloading(false);
        setError("Login Failed");

        console.error("Login failed:", result);

        return;
      }

      console.log(
        "Login successful, navigating to dashboard..."
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      setloading(false);

      // Default dashboard according to role
      const fallbackPath =
        form.role === "admin"
          ? "/admin/dashboard"
          : "/user/dashboard";

      // Get previous location if available
      let target = location.state?.from || fallbackPath;

      // Prevent student from accessing admin route
      if (
        form.role === "user" &&
        typeof target === "string" &&
        target.startsWith("/admin")
      ) {
        console.warn(
          "Login: preventing navigation to admin route for student; using fallback"
        );

        target = fallbackPath;
      }

      // Prevent admin from accessing user route
      else if (
        form.role === "admin" &&
        typeof target === "string" &&
        target.startsWith("/user")
      ) {
        console.warn(
          "Login: preventing navigation to user route for admin; using fallback"
        );

        target = fallbackPath;
      }

      console.log("Navigating to:", target);

      navigate(target, {
        replace: true,
      });
    } catch (err) {
      setloading(false);

      console.error("Login Error:", err);

      setError(
        "An unexpected connection error occurred"
      );
    }
  };

  return (
    <div className={s.pageContainer}>
      <div className={s.mainCard}>

        {/* =========================
            LEFT INFO PANEL
        ========================== */}

        <section className={s.infoPanel}>
          <span className={s.roleBadge}>
            College role login
          </span>

          <h1 className={s.infoTitle}>
            Choose student or admin first, then open the
            current library panel.
          </h1>

          <p className={s.infoDescription}>
            Select the role you want to enter, then login
            with the matching account.
          </p>

          <div className={s.infoBoxesContainer}>

            {/* Student Info */}

            <div className={s.infoBox}>
              <p className={s.infoBoxTitle}>
                <UserRound size={16} />
                Student SignIn
              </p>

              <p className={s.infoBoxText}>
                Register a new student account using the
                "Create Account" link to test student
                functionality with real data.
              </p>
            </div>

            {/* Admin Info */}

            <div className={s.infoBox}>
              <p className={s.infoBoxTitle}>
                <ShieldCheck size={16} />
                Admin Access
              </p>

              <p className={s.infoBoxText}>
                Log in using your registered admin account
                to access the administrative dashboard and
                catalog features.
              </p>
            </div>

          </div>
        </section>

        {/* =========================
            RIGHT LOGIN FORM
        ========================== */}

        <section className={s.formPanel}>
          <div className={s.formInner}>

            {/* Back to Home */}

            <Link
              to="/"
              className={s.backLink}
            >
              Back to Home
            </Link>

            <h2 className={s.formTitle}>
              Login Account
            </h2>

            <p className={s.formSubtitle}>
              Select your role and use your college library
              account credentials
            </p>

            <form
              action=""
              method="post"
              className={s.form}
              onSubmit={handleSubmit}
            >

              {/* =========================
                  ROLE SELECTION
              ========================== */}

              <div className={s.roleContainer}>

                <p className={s.roleBadge}>
                  Choose login role
                </p>

                <div className={s.roleGrid}>

                  {roleChoices.map((choice) => {
                    const Icon = choice.icon;

                    return (
                      <label
                        key={choice.value}
                        className={`${s.roleOption} ${
                          form.role === choice.value
                            ? s.roleOptionSelected
                            : s.roleOptionUnselected
                        }`}
                      >

                        <input
                          type="radio"
                          name="role"
                          value={choice.value}
                          checked={
                            form.role === choice.value
                          }
                          onChange={handleChange}
                          className={s.roleRadio}
                        />

                        <span
                          className={s.roleIconLabel}
                        >
                          <Icon size={16} />

                          {choice.label}
                        </span>

                      </label>
                    );
                  })}

                </div>
              </div>

              {/* =========================
                  EMAIL
              ========================== */}

              <label className="block">

                <span className={s.fieldLabel}>
                  <Mail size={15} />
                  Email Address
                </span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@campus.edu"
                  className={s.input}
                  required
                />

              </label>

              {/* =========================
                  PASSWORD
              ========================== */}

              <label className="block">

                <span className={s.fieldLabel}>
                  <LockKeyhole size={15} />
                  Password
                </span>

                <div className={s.passwordWrapper}>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={s.passwordInput}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className={
                      s.togglePasswordButton
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </label>

              {/* =========================
                  ERROR
              ========================== */}

              {error && (
                <div className={s.errorMessage}>
                  {error}
                </div>
              )}

              {/* =========================
                  FOOTER
              ========================== */}

              <div className={s.footerFlex}>

                <span className={s.footerText}>
                  {form.role === "admin"
                    ? "Admin accounts use existing credentials"
                    : "Student signup is available below"}
                </span>

                {form.role === "user" && (
                  <Link
                    to="/signup"
                    className={s.signupLink}
                  >
                    Create Account
                  </Link>
                )}

              </div>

              {/* =========================
                  LOGIN BUTTON
              ========================== */}

              <button
                type="submit"
                disabled={loading}
                className={s.submitButton}
              >
                {loading
                  ? "Logging in..."
                  : "Login now"}

                {!loading && (
                  <ArrowRight size={15} />
                )}
              </button>

            </form>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Login;