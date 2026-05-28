// ===== INITIAL SETUP: Page title and subtitle =====
const pageHeaderData = {
  title: "Academic Calendar",
  subtitle: "2025–2026",
};

document.getElementById("title").textContent = pageHeaderData.title || "";
document.getElementById("subtitle").textContent = pageHeaderData.subtitle || "";

// Function checks if a specific date falls within a term's start and end dates
function checkIfDateInTerm(date, termData) {
  // This if statement prevents errors if start or end dates are missing
  if (!termData.START || !termData.END) return false;
  
  // Split the date strings from format "MM/DD/YYYY" into separate components
  const [startMonth, startDay, startYear] = termData.START.split('/');
  const [endMonth, endDay, endYear] = termData.END.split('/');
  
  // Create Date objects (month is 0-indexed, so subtract 1 from month)
  const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
  const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));

  // Return true if date is within the term range
  return date >= startDate && date <= endDate;
}

// ===== MAIN CALENDAR BUILDING SECTION =====

function buildSchoolCalendar(calendarId, calculationsListId, schoolKey, calendarData, yearKey) {
// Get the container elements from HTML
const calendarContainer = document.getElementById(calendarId);
const calculationsList = document.getElementById(calculationsListId);

if (calendarContainer) {

  // Weekday abbreviations for calendar header
  const daysOfWeek = ["U", "M", "T", "W", "R", "F", "S"];

  {
      // Navigate through the JSON structure to get all events
      const allEvents = calendarData[yearKey][schoolKey];

      // Filter to get only term events (EVENT_CODE === "TRM")
      const academicTerms = allEvents.filter(event => event.EVENT_CODE === "TRM");

      // ===== CALCULATE TERM DURATIONS =====
      const termDurationData = [];

      academicTerms.forEach(term => {
        if (term.START && term.END) {
          // Parse start date
          const [startMonth, startDay, startYear] = term.START.split('/');
          const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
          
          // Parse end date
          const [endMonth, endDay, endYear] = term.END.split('/');
          const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
          
          // Calculate duration
          const timeDifferenceMs = endDate - startDate;
          const totalDays = Math.ceil(timeDifferenceMs / (1000 * 60 * 60 * 24)) + 1;
          
          // Break down into weeks and extra days
          const fullWeeks = Math.floor(totalDays / 7);
          const extraDays = totalDays % 7;
          
          termDurationData.push({
            term: term.TERM_DESC,
            days: totalDays,
            weeks: fullWeeks,
            remainingDays: extraDays
          });
        }
      });

      // Display term calculations in the UI
      termDurationData.forEach(termData => {
        const termColor = termData.term.toLowerCase();
        calculationsList.insertAdjacentHTML('beforeend', `
          <li class="calculation-item ${termColor}">  
            <strong>${termData.term}:</strong> ${termData.days} Days -- ${termData.weeks} weeks ${termData.remainingDays} days
          </li>
        `);
      });

      // ===== DETECT OVERLAPPING TERMS =====
      const termOverlaps = [];

      academicTerms.forEach((firstTerm, i) => { 
        academicTerms.forEach((secondTerm, j) => {
          // Only check each pair once (avoid duplicates)
          if (i < j) {
            // Parse first term dates
            const [firstTermStartMonth, firstTermStartDay, firstTermStartYear] = firstTerm.START.split('/');
            const [firstTermEndMonth, firstTermEndDay, firstTermEndYear] = firstTerm.END.split('/');
            const firstTermStartDate = new Date(parseInt(firstTermStartYear), parseInt(firstTermStartMonth) - 1, parseInt(firstTermStartDay));
            const firstTermEndDate = new Date(parseInt(firstTermEndYear), parseInt(firstTermEndMonth) - 1, parseInt(firstTermEndDay));

            // Parse second term dates
            const [secondTermStartMonth, secondTermStartDay, secondTermStartYear] = secondTerm.START.split('/');
            const [secondTermEndMonth, secondTermEndDay, secondTermEndYear] = secondTerm.END.split('/');
            const secondTermStartDate = new Date(parseInt(secondTermStartYear), parseInt(secondTermStartMonth) - 1, parseInt(secondTermStartDay));
            const secondTermEndDate = new Date(parseInt(secondTermEndYear), parseInt(secondTermEndMonth) - 1, parseInt(secondTermEndDay));

            // Check if terms overlap
            if (firstTermEndDate >= secondTermStartDate && secondTermEndDate >= firstTermStartDate) {
              const overlapStartDate = new Date(Math.max(firstTermStartDate, secondTermStartDate)); 
              const overlapEndDate = new Date(Math.min(firstTermEndDate, secondTermEndDate));
              
              termOverlaps.push({
                overlapStart: overlapStartDate,
                overlapEnd: overlapEndDate,
              });
            }
          }
        });
      });

      // Display overlaps in the UI
      termOverlaps.forEach(overlapPeriod => {
        calculationsList.insertAdjacentHTML('beforeend', `
          <li class="overlap-item">  
            <strong>Overlap:</strong> ${overlapPeriod.overlapStart.toLocaleDateString()} -- ${overlapPeriod.overlapEnd.toLocaleDateString()}
          </li>
        `);
      });

      // ===== FIND DATE RANGE FOR CALENDAR =====
      function getStartAndEndDates(academicTerms) {
        const allTermDates = [];
        
        academicTerms.forEach(term => {
          // Add start date
          const [startMonth, startDay, startYear] = term.START.split('/');
          const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
          allTermDates.push(startDate); 
          
          // Add end date if it exists
          if (term.END) { 
            const [endMonth, endDay, endYear] = term.END.split('/');
            const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
            allTermDates.push(endDate); 
          }
        });
        
        // Find earliest and latest dates using spread operator
        const earliestDate = new Date(Math.min(...allTermDates));
        const latestDate = new Date(Math.max(...allTermDates));
        return [earliestDate, latestDate];
      }

      const [calendarStartDate, calendarEndDate] = getStartAndEndDates(academicTerms);

      // Calculate how many months to display
      const calendarStartYear = calendarStartDate.getFullYear();
      const calendarStartMonth = calendarStartDate.getMonth();
      const calendarEndYear = calendarEndDate.getFullYear();
      const calendarEndMonth = calendarEndDate.getMonth();
      const monthsInCalendar = (calendarEndYear - calendarStartYear) * 12 + (calendarEndMonth - calendarStartMonth) + 1;
      
      // ===== BUILD MONTHS OF CALENDAR =====
      for (let monthIndex = 0; monthIndex < monthsInCalendar; monthIndex++) {
        // Calculate the current month date
        const currentMonthDate = new Date(calendarStartYear, calendarStartMonth + monthIndex, 1);
        
        // Get month name and year
        const currentMonthName = currentMonthDate.toLocaleString("en-US", { month: "long" });
        const currentYear = currentMonthDate.getFullYear();
        
        // ===== CREATE MONTH CONTAINER =====
        const monthContainer = document.createElement("div");
        monthContainer.className = "month";
        
        // ===== ADD MONTH HEADER =====
        const monthHeader = document.createElement("h3");
        monthHeader.textContent = `${currentMonthName} ${currentYear}`;
        monthContainer.appendChild(monthHeader);
        
        // ===== CREATE DAY GRID CONTAINER =====
        const daysGrid = document.createElement("div");
        daysGrid.className = "days";
        
        // ===== ADD DAY-OF-WEEK LABELS =====
        daysOfWeek.forEach(dayLabel => {
          const dayHeaderCell = document.createElement("div");
          dayHeaderCell.className = "day label";
          dayHeaderCell.textContent = dayLabel;
          daysGrid.appendChild(dayHeaderCell);
        });
        
        // ===== CALCULATE CALENDAR LAYOUT =====
        const firstDayOfWeek = new Date(currentYear, currentMonthDate.getMonth(), 1).getDay();
        const totalDaysInMonth = new Date(currentYear, currentMonthDate.getMonth() + 1, 0).getDate();
        
        // ===== ADD LEADING BLANK CELLS =====
        for (let emptyIndex = 0; emptyIndex < firstDayOfWeek; emptyIndex++) {
          const blankCell = document.createElement("div");
          blankCell.className = "day";
          daysGrid.appendChild(blankCell);
        }
        
        // ===== ADD NUMBERED DAY CELLS =====
        for (let dayNumber = 1; dayNumber <= totalDaysInMonth; dayNumber++) {
          const dayCell = document.createElement("div");
          dayCell.className = "day";
          dayCell.textContent = dayNumber;
          
          // ===== CHECK FOR TERM HIGHLIGHTING =====
          const cellDate = new Date(currentYear, currentMonthDate.getMonth(), dayNumber);
          let termMatchCount = 0; 
          let termColor = "";

          // Count how many terms this date falls into
          academicTerms.forEach(academicTerm => {
            if (checkIfDateInTerm(cellDate, academicTerm)) {
              termMatchCount++;
              termColor = academicTerm.TERM_DESC.toLowerCase();  
            }          
          });
          
          // Apply appropriate CSS class based on match count
          if (termMatchCount === 0) {
            // No term - no highlighting
          } else if (termMatchCount === 1) {
            // Single term - apply term color
            dayCell.classList.add(`${termColor}-term`);
          } else if (termMatchCount >= 2) {
            // Multiple terms - show overlap
            dayCell.classList.add('overlap-term');
          }
          
          // Add the completed day cell to the grid
          daysGrid.appendChild(dayCell);
        }
        
        // ===== ASSEMBLE MONTH =====
        monthContainer.appendChild(daysGrid);
        calendarContainer.appendChild(monthContainer);
      }
  }
}
}
