import { SearchIcon } from 'lucide-react';
import {userBooksPageStyles as s } from '../assets/dummyStyles';
import { useAuth } from '../shared/AuthContext';
import { useLibrary } from '../shared/LibraryContext';
import { useMemo, useState } from 'react';

const UserBook = () => {

     const {currentUser} = useAuth();
     const {currentUserHistory} = useLibrary();
     const [filters,setFilters] = useState({
          search:"",
          status:"All",
     });

  const filteredIssuedBooks = useMemo(() => {
    return currentUserHistory.filter((record) => {
      const term = filters.search.toLowerCase();
      const matchesSearch =
        !filters.search ||
        record.title.toLowerCase().includes(term) ||
        record.author.toLowerCase().includes(term) ||
        record.bookCode.toLowerCase().includes(term) ||
        currentUser?.name?.toLowerCase().includes(term);

      const matchesStatus =
        filters.status === "All" || record.liveStatus === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [currentUser?.name, currentUserHistory, filters]);


  const handleFilterChange = (e) => {
     const { name, value } = e.target;
     setFilters((prevFilters) => ({
       ...prevFilters,
       [name]: value,
     }));
  }


     return (
    <div className={s.pageContainer}>
     <section className={s.heroSection}>
          <div className={s.heroFlex}>
               <div>
                    <span className={s.heroBadge}>
                         Student Book Page
                    </span>
                    <h1 className={s.heroTitle}>Book cards with richer content and cleaner grouped details.</h1>
                    <p className={s.heroText}>Each card now uses a clearer top summary status, status badge, context chips,  and a better medium-card layout so the details feel more structured and elegant. </p>
               </div>
          </div>
     </section>
     <section className={s.mainSection}>
          <div className={s.sectionHeader}>
               <div>
                    <h2 className={s.sectionTitle}>My Issued Books</h2>
                    <p className={s.sectionSubtitle}>Medium-size cards now separate the headline details from the supporting record data.</p>
               </div>
          </div>
          <div className={s.filtersContainer}>
               <label className={s.filterLabel}> 
                    <span className={s.filterLabelValue}>Search My Books
                    </span>
                    <div className={s.searchWrapper}>
                         <SearchIcon size={16} className={s.searchIcon}/>
                         <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search by book, name, code, borrower or author" clasName={s.searchInput}/>
                    </div>
               </label>
               <label className={s.filterLabel}>
                    <span className={s.filterLabelSpan}>Status</span>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className={s.selectInput}>
                              <option option value="All">All Status</option>
                              <option value="Borrowed">Borrowed</option>
                              <option value="Overdue">Overdue</option>
                              <option value="Returned">Returned</option>
                    </select>
               </label>
          </div>
          <div className={s.booksGrid}>
               {filteredIssuedBooks.length > 0 ? (
                    filteredIssuedBooks.map((record) => (
                         <div key={record.bookCode} className={s.bookCard}>
                              <div className={s.bookCardHeader}>
                                   <h3 className={s.bookCardTitle}>{record.title}</h3>
                                   <span className={s.bookCardStatus}>{record.liveStatus}</span>
                              </div>
                              <div className={s.bookCardDetails}>
                                   <p className={s.bookCardDetail}><strong>Author:</strong> {record.author}</p>
                                   <p className={s.bookCardDetail}><strong>Book Code:</strong> {record.bookCode}</p>
                                   <p className={s.bookCardDetail}><strong>Borrower:</strong> {currentUser?.name}</p>
                                   <p className={s.bookCardDetail}><strong>Issued Date:</strong> {record.issuedDate}</p>
                                   <p className={s.bookCardDetail}><strong>Return Date:</strong> {record.returnDate}</p>
                              </div>
                         </div>
                    ))
               ) : (
                    <p className={s.noBooksMessage}>No books found matching the criteria.</p>
               )}
          </div>
     </section>
    </div>
  )
}

export default UserBook