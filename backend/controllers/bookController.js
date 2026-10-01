import Issue from "../models/issue.js";
import User from "../models/User.js";
import FineSetting from "../models/fineSetting.js";

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const getLocalIsoDate = (value = new Date()) => {
  const d = new Date(value);

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ======================================================
// START OF DAY
// ======================================================

const getStartOfDay = (value) => {
  const date = new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
};

// ======================================================
// GET DIFFERENCE IN DAYS
// ======================================================

const getDiffInDays = (targetDateString) => {
  return Math.round(
    (
      getStartOfDay(targetDateString).getTime() -
      getStartOfDay(new Date()).getTime()
    ) / 86400000
  );
};

// ======================================================
// CALCULATE OVERDUE UNITS
// ======================================================

const getOverdueUnits = (overdueDays, interval) => {
  if (overdueDays <= 0) {
    return 0;
  }

  const divisor = {
    day: 1,
    week: 7,
    month: 30,
    year: 365,
  }[interval] || 1;

  return Math.ceil(overdueDays / divisor);
};

// ======================================================
// CALCULATE FINE
// ======================================================

const calculateFine = (
  issue,
  fineRate = 10,
  fineInterval = "day"
) => {
  if (!issue) {
    return 0;
  }

  if (issue.fineCleared) {
    return 0;
  }

  if (issue.returnedOn) {
    return 0;
  }

  const overdueDays = Math.max(
    0,
    -getDiffInDays(issue.dueDate)
  );

  const overdueFine =
    getOverdueUnits(
      overdueDays,
      fineInterval
    ) * Number(fineRate || 0);

  const manualFine =
    Number(issue.manualFine || 0);

  return overdueFine + manualFine;
};

// ======================================================
// 1. SEARCH STUDENT BY ROLL NUMBER
// ======================================================

export async function searchStudentbyRoll(req, res) {
  try {
    const roll = String(
      req.query.roll || ""
    ).trim();

    if (!roll) {
      return res.status(200).json({
        success: true,
        students: [],
      });
    }

    const rollRegex = new RegExp(
      roll.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );

    const students = await User.find({
      role: "user",
      isVerified: true,
      isProfileComplete: true,
      rollNo: {
        $regex: rollRegex,
      },
    })
      .select(
        "name email phone department stream semester year rollNo studentId"
      )
      .limit(12);

    const mappedStudents = students.map(
      (student) => ({
        id: student._id,

        name: student.name,

        email: student.email,

        phone: student.phone || "",

        department:
          student.department || "",

        stream:
          student.stream || "",

        academicYear:
          student.year || "",

        semester:
          student.semester || "",

        rollNumber:
          student.rollNo || "",

        studentId:
          student.studentId || "",
      })
    );

    return res.status(200).json({
      success: true,
      students: mappedStudents,
    });

  } catch (error) {
    console.error(
      "Error searching students by roll number:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error searching students by roll number",
      error: error.message,
    });
  }
}

// ======================================================
// 2. ISSUE MANUAL BOOKS TO STUDENT
// ======================================================

export async function issueManualBook(req, res) {
  try {
    const {
      studentDetails,
      books,
      fineRate,
      fineInterval,
    } = req.body;

    // --------------------------------------------------
    // Validate books
    // --------------------------------------------------

    if (
      !Array.isArray(books) ||
      books.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No books found",
      });
    }

    // --------------------------------------------------
    // Validate student
    // --------------------------------------------------

    if (
      !studentDetails ||
      !studentDetails.rollNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student roll number is required",
      });
    }

    const student = await User.findOne({
      role: "user",
      rollNo: String(
        studentDetails.rollNumber
      ).trim(),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // --------------------------------------------------
    // Validate books
    // --------------------------------------------------

    const todayIso = getLocalIsoDate();

    const validBooks = books.filter(
      (book) =>
        book &&
        book.title &&
        book.bookCode &&
        book.dueDate
    );

    if (validBooks.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Please add at least one valid manual book entry with book code and due date",
      });
    }

    // --------------------------------------------------
    // Create issue records
    // --------------------------------------------------

    const createdIssues =
      await Promise.all(
        validBooks.map((book) =>
          Issue.create({
            source: "manual",

            bookCode:
              String(book.bookCode).trim(),

            title:
              String(book.title).trim(),

            userEmail:
              student.email
                .toLowerCase()
                .trim(),

            userName:
              student.name,

            issuedOn:
              todayIso,

            dueDate:
              book.dueDate,

            returnedOn:
              null,

            fineRate:
              Number(
                book.fineRate ??
                fineRate ??
                10
              ),

            fineInterval:
              book.fineInterval ??
              fineInterval ??
              "day",

            manualFine: 0,

            fineCleared: false,

            clearedFineAmount: 0,

            department:
              String(
                studentDetails.department ||
                  student.department ||
                  "General"
              ).trim(),

            stream:
              String(
                studentDetails.stream ||
                  student.stream ||
                  "General"
              ).trim(),

            year:
              String(
                studentDetails.academicYear ||
                  student.year ||
                  "1st Year"
              ).trim(),

            semester:
              String(
                studentDetails.semester ||
                  student.semester ||
                  "Semester 1"
              ).trim(),

            rollNumber:
              String(
                studentDetails.rollNumber ||
                  student.rollNo ||
                  "Not assigned"
              ).trim(),

            studentId:
              student.studentId ||
              `ST-${student._id
                .toString()
                .slice(-6)
                .toUpperCase()}`,
          })
        )
      );

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        `${createdIssues.length} manual books issued successfully`,

      count:
        createdIssues.length,

      issues:
        createdIssues,
    });

  } catch (error) {
    console.error(
      "Error issuing manual books:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error issuing manual books",
      error: error.message,
    });
  }
}

// ======================================================
// 3. GET ALL ISSUES - ADMIN
// ======================================================

export async function getIssues(req, res) {
  try {
    const issues =
      await Issue.find({})
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      issues,
    });

  } catch (error) {
    console.error(
      "Error while fetching issues:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error while fetching issues",
      error: error.message,
    });
  }
}

// ======================================================
// 4. GET ISSUES FOR LOGGED-IN STUDENT
// ======================================================

export async function getStudentIssues(
  req,
  res
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(
      req.user.id
    ).select("email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const issues =
      await Issue.find({
        userEmail:
          user.email
            .toLowerCase()
            .trim(),
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      issues,
    });

  } catch (error) {
    console.error(
      "Error while fetching student issues:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error while fetching student issues",
      error: error.message,
    });
  }
}

// ======================================================
// 5. RETURN BOOK
// ======================================================

export async function returnBook(
  req,
  res
) {
  try {
    const issue =
      await Issue.findById(
        req.params.id
      );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message:
          "Issue record not found",
      });
    }

    if (issue.returnedOn) {
      return res.status(400).json({
        success: false,
        message:
          "Book already returned",
      });
    }

    issue.returnedOn =
      getLocalIsoDate();

    await issue.save();

    return res.status(200).json({
      success: true,
      message:
        "Book returned successfully",
      issue,
    });

  } catch (error) {
    console.error(
      "Error while returning book:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error while returning book",
      error: error.message,
    });
  }
}

// ======================================================
// 6. APPLY MANUAL FINE
// ======================================================

export async function applyFine(
  req,
  res
) {
  try {
    const fineAmount =
      Number(req.body.amount);

    if (
      !Number.isFinite(fineAmount) ||
      fineAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Fine amount must be a valid positive number",
      });
    }

    const issue =
      await Issue.findById(
        req.params.id
      );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message:
          "Issue record not found",
      });
    }

    issue.manualFine =
      fineAmount;

    if (fineAmount > 0) {
      issue.fineCleared = false;
    }

    await issue.save();

    return res.status(200).json({
      success: true,
      message:
        "Manual fine applied successfully",
      issue,
    });

  } catch (error) {
    console.error(
      "Error while applying fine:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error while applying fine",
      error: error.message,
    });
  }
}

// ======================================================
// 7. CLEAR FINE
// ======================================================

export async function clearFine(
  req,
  res
) {
  try {
    const issue =
      await Issue.findById(
        req.params.id
      );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message:
          "Issue record not found",
      });
    }

    // IMPORTANT:
    // Calculate fine BEFORE clearing it.
    const currentFine =
      calculateFine(
        issue,
        issue.fineRate,
        issue.fineInterval
      );

    issue.clearedFineAmount =
      currentFine;

    issue.manualFine = 0;

    issue.fineCleared = true;

    await issue.save();

    return res.status(200).json({
      success: true,
      message:
        "Fine cleared successfully",
      issue,
      clearedAmount:
        currentFine,
    });

  } catch (error) {
    console.error(
      "Error while clearing fine:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error while clearing fine",
      error: error.message,
    });
  }
}

// ======================================================
// 8. GET FINE SETTINGS
// ======================================================

export async function getFineSettings(
  req,
  res
) {
  try {
    let settings =
      await FineSetting.findOne({});

    // FIX:
    // create(), NOT creater()
    if (!settings) {
      settings =
        await FineSetting.create({
          amount: 10,
          interval: "day",
        });
    }

    return res.status(200).json({
      success: true,
      settings,
    });

  } catch (error) {
    console.error(
      "Error while fetching fine settings:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error while fetching fine settings",
      error: error.message,
    });
  }
}

// ======================================================
// 9. UPDATE FINE SETTINGS
// ======================================================

export async function updateFineSettings(
  req,
  res
) {
  try {
    const {
      amount,
      interval,
    } = req.body;

    // --------------------------------------------------
    // Validate amount
    // --------------------------------------------------

    if (
      amount !== undefined &&
      (
        !Number.isFinite(
          Number(amount)
        ) ||
        Number(amount) < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Fine amount must be a valid positive number",
      });
    }

    // --------------------------------------------------
    // Validate interval
    // --------------------------------------------------

    const allowedIntervals = [
      "day",
      "week",
      "month",
      "year",
    ];

    if (
      interval !== undefined &&
      !allowedIntervals.includes(
        interval
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid fine interval",
      });
    }

    // --------------------------------------------------
    // Find existing settings
    // --------------------------------------------------

    let settings =
      await FineSetting.findOne({});

    if (settings) {
      if (amount !== undefined) {
        settings.amount =
          Number(amount);
      }

      if (interval !== undefined) {
        settings.interval =
          interval;
      }

      await settings.save();

    } else {
      settings =
        await FineSetting.create({
          amount:
            Number(amount ?? 10),

          interval:
            interval ?? "day",
        });
    }

    return res.status(200).json({
      success: true,
      message:
        "Fine settings updated successfully",
      settings,
    });

  } catch (error) {
    console.error(
      "Error while updating fine settings:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error while updating fine settings",
      error: error.message,
    });
  }
}