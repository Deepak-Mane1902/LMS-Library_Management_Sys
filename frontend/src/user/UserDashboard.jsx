import { AlertTriangle, BookCopy, GraduationCap, IdCard, ReceiptText, Sparkles } from 'lucide-react';
import {userDashboardPageStyles as s } from '../assets/dummyStyles';
import { useAuth } from '../shared/AuthContext';
import { useLibrary } from '../shared/LibraryContext';

const UserDashboard = () => {

 const { currentUser } = useAuth();
  const { currentUserHistory, currentUserSummary } = useLibrary();

  const activeCount = currentUserHistory.filter(
    (item) => item.liveStatus === "Borrowed",
  ).length;
  const overdueCount = currentUserHistory.filter(
    (item) => item.liveStatus === "Overdue",
  ).length;
  const pendingFine = currentUserSummary?.totalFine ?? 0;
  const clearedFine = currentUserSummary?.totalClearedFine ?? 0;

  const overviewStats = [
    {
      key: "issues",
      label: "Total Issues",
      value: `${currentUserHistory.length}`,
      note: "All library records attached to your student account",
      icon: BookCopy,
    },
    {
      key: "borrowed",
      label: "Active Books",
      value: `${activeCount}`,
      note: "Books currently mapped to your profile",
      icon: GraduationCap,
    },
    {
      key: "overdue",
      label: "Overdue Books",
      value: `${overdueCount}`,
      note: "Needs follow-up before more penalties are added",
      icon: AlertTriangle,
    },
    {
      key: "pending-fine",
      label: "Pending Fine",
      value: `Rs. ${pendingFine}`,
      note: "Fine amount still pending on active records",
      icon: ReceiptText,
    },
    {
      key: "cleared-fine",
      label: "Fine Cleared",
      value: `Rs. ${clearedFine}`,
      note: "Total fine amount already cleared on your account",
      icon: ReceiptText,
    },
  ];

  const recentBooks = currentUserHistory.slice(0, 3);

  


  return (
    <div className={s.pageContainer}>
     <section className={s.heroSection}>
          <div className={s.heroGrid}>
               <div className={s.heroLeft} >
                    <span className={s.heroBadge}>
                         <Sparkles size={14} />
                         Student Dashboard
                    </span>
                    <h1 className={s.heroTitle}>Welcome Back, {currentUser?.name ?? "Reader"} 👋 profile, semester, status, and your latest library books.</h1>
                    <p className={s.heroText}>
                         Your Dashboard now keeps the important account summary at the top and shows the most recent issued books directly below. 
                    </p>
               </div>
               <div className={s.rightColumnGrid}>
                    <article className={s.profileCard}>
                         <div className={s.profileHeader}>
                              <div className="min-w-0">
                                   <p className={s.profileLabel}>
                                        Student Profile
                                   </p>
                                   <p className={s.profileName}>
                                        {currentUser?.name ?? "Campus Reader"}
                                   </p>
                              </div>
                              <span className={s.profileIconWrapper}>
                                   <IdCard size={20}/>
                              </span>
                         </div>
                         <div className={s.profileDetails}>
                              <div className={s.profileDetailItem}>
                                   Student ID: <span className={s.profileDetailValue}>{currentUser?.studentId ?? "N/A"}</span>
                              </div>
                              <div className={s.profileDetailItem}>
                                   Roll Number: <span className={s.profileDetailValue}>{currentUser?.rollNumber ?? "N/A"}</span>
                              </div>
                              <div className={s.profileDetailItem}>
                                   Department: <span className={s.profileDetailValue}>{currentUser?.department ?? "General"}</span>
                              </div>
                         </div>
                    </article>
                    <article className={s.semesterCard}>
                         <div className={s.semesterHeader}>
                              <div>
                              <p className={s.semesterLabel}>
                                   Semester Details
                              </p>
                              <p className={s.semesterValue}>
                                   {currentUser?.semester ?? "Semester 1"}
                              </p>                                   
                              </div>
                              <span className={s.semesterIconWrapper}>
                                   <GraduationCap size={20}/>
                              </span>
                         </div>
                         <div clasName={s.semesterDetails}>
                              <div className={s.semesterDetailItem}>
                                   Stream: <span className={s.semesterDetailValue}>{currentUser?.stream ?? "General"}</span>
                              </div><br />
                              <div className={s.semesterDetailItem}>
                                   Academic Year: <span className={s.semesterDetailValue}>{currentUser?.academicYear ?? "1st year"}</span>
                              </div>
                         </div>
                    </article>
               </div>
          </div>
     </section>
     <section className={s.statsGrid}>
          {overviewStats.map((stat) => (
               <article key={stat.key} className={s.statCard}>
                    <div className={s.statHeader}>
                         <div>
                              <p className={s.statLabel}>{stat.label}</p>
                              <p className={s.statValue}>{stat.value}</p>
                         </div>
                         <span className={s.statIconWrapper}>
                              <stat.icon size={20}/>   
                         </span>
                    </div>
                    <p className={s.statNote}>{stat.note}</p>
               </article>
          ))}
     </section>
     <section className={s.recentSection}>
          <h2 className={s.recentTitle}>Recent Books</h2>
          {recentBooks.length > 0 ? (
               <div className={s.recentGrid}>
                    {recentBooks.map((book) => (
                         <article key={book.id} className={s.recentCard}>
                              <div className={s.recentHeader}>
                                   <p className={s.recentBookTitle}>{book.title}</p>
                                   <span className={s.recentStatusBadge}>{book.liveStatus}</span>
                              </div>
                              <p className={s.recentBookAuthor}>by {book.author}</p>
                              <p className={s.recentBookDetails}>
                                   Issued on: {new Date(book.issueDate).toLocaleDateString()}<br />
                                   Due on: {new Date(book.dueDate).toLocaleDateString()}
                              </p>
                         </article>
                    ))}
               </div>
          ) : (
               <p className={s.noRecentBooks}>No recent books found.</p>
          )}
     </section>
    </div>
  )
}

export default UserDashboard