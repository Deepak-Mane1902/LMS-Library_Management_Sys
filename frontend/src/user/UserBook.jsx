import { SearchIcon } from "lucide-react";
import { userBooksPageStyles as s } from "../assets/dummyStyles";
import { useLibrary } from "../shared/LibraryContext";
import { useMemo, useState } from "react";

const UserBook = () => {
  const { books } = useLibrary();

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
  });

  const filteredBooks = useMemo(() => {
    const term = filters.search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        !term ||
        book.title?.toLowerCase().includes(term) ||
        book.author?.toLowerCase().includes(term) ||
        book.bookCode?.toLowerCase().includes(term) ||
        book.category?.toLowerCase().includes(term) ||
        book.department?.toLowerCase().includes(term) ||
        book.stream?.toLowerCase().includes(term) ||
        book.year?.toLowerCase().includes(term);

      const matchesStatus =
        filters.status === "All" ||
        book.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [books, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className={s.pageContainer}>
      {/* HERO */}
      <section className={s.heroSection}>
        <div className={s.heroFlex}>
          <div>
            <span className={s.heroBadge}>
              Student Book Page
            </span>

            <h1 className={s.heroTitle}>
              Explore the library collection.
            </h1>

            <p className={s.heroText}>
              Browse available books, search by title or author,
              and check the current availability of every book in
              the library.
            </p>
          </div>
        </div>
      </section>

      {/* BOOK SECTION */}
      <section className={s.mainSection}>
        <div className={s.sectionHeader}>
          <div>
            <h2 className={s.sectionTitle}>
              Library Books
            </h2>

            <p className={s.sectionSubtitle}>
              Browse all books currently available in the library catalogue.
            </p>
          </div>

          <div>
            <strong>
              {filteredBooks.length}
            </strong>{" "}
            Books
          </div>
        </div>

        {/* FILTERS */}
        <div className={s.filtersContainer}>
          <label className={s.filterLabel}>
            <span className={s.filterLabelValue}>
              Search Books
            </span>

            <div className={s.searchWrapper}>
              <SearchIcon
                size={16}
                className={s.searchIcon}
              />

              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by book, author, code or category"
                className={s.searchInput}
              />
            </div>
          </label>

          <label className={s.filterLabel}>
            <span className={s.filterLabelSpan}>
              Status
            </span>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className={s.selectInput}
            >
              <option value="All">
                All Status
              </option>

              <option value="Available">
                Available
              </option>

              <option value="Borrowed">
                Borrowed
              </option>

              <option value="Overdue">
                Overdue
              </option>
            </select>
          </label>
        </div>

        {/* BOOK GRID */}
        <div className={s.booksGrid}>
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div
                key={book.id}
                className={s.bookCard}
              >
                {/* CARD HEADER */}
                <div className={s.bookCardHeader}>
                  <div>
                    <h3 className={s.bookCardTitle}>
                      {book.title}
                    </h3>

                    <p>
                      {book.author}
                    </p>
                  </div>

                  <span className={s.bookCardStatus}>
                    {book.status}
                  </span>
                </div>

                {/* CARD DETAILS */}
                <div className={s.bookCardDetails}>
                  <p className={s.bookCardDetail}>
                    <strong>Book Code:</strong>{" "}
                    {book.bookCode}
                  </p>

                  <p className={s.bookCardDetail}>
                    <strong>Category:</strong>{" "}
                    {book.category}
                  </p>

                  <p className={s.bookCardDetail}>
                    <strong>Department:</strong>{" "}
                    {book.department}
                  </p>

                  <p className={s.bookCardDetail}>
                    <strong>Stream:</strong>{" "}
                    {book.stream}
                  </p>

                  <p className={s.bookCardDetail}>
                    <strong>Year:</strong>{" "}
                    {book.year}
                  </p>

                  <p className={s.bookCardDetail}>
                    <strong>Shelf:</strong>{" "}
                    {book.shelf}
                  </p>

                  <p className={s.bookCardDetail}>
                    <strong>Total Copies:</strong>{" "}
                    {book.copies}
                  </p>

                  <p className={s.bookCardDetail}>
                    <strong>Available Copies:</strong>{" "}
                    {book.availableCopies}
                  </p>

                  <p className={s.bookCardDetail}>
                    <strong>Timeline:</strong>{" "}
                    {book.timeline}
                  </p>

                  <p className={s.bookCardDetail}>
                    <strong>Fine:</strong>{" "}
                    {book.fineLabel}
                  </p>
                </div>

                {/* STATUS */}
                <div>
                  {book.availableCopies > 0 ? (
                    <span>
                      Available for issue
                    </span>
                  ) : (
                    <span>
                      Currently unavailable
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className={s.noBooksMessage}>
              No books found matching the criteria.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserBook;