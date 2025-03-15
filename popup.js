document.addEventListener("DOMContentLoaded", () => {
  const startDatePicker = document.getElementById("start-date-picker");
  const endDatePicker = document.getElementById("end-date-picker");
  const sortSelect = document.getElementById("sort");
  const timeList = document.getElementById("time-list");

  // Set default dates to today
  const today = new Date().toISOString().split("T")[0];
  startDatePicker.value = today;
  endDatePicker.value = today;

  // Load data for the selected date range
  loadDataForDateRange(today, today);

  // Add event listeners
  startDatePicker.addEventListener("change", () => {
    loadDataForDateRange(startDatePicker.value, endDatePicker.value);
  });

  endDatePicker.addEventListener("change", () => {
    loadDataForDateRange(startDatePicker.value, endDatePicker.value);
  });

  sortSelect.addEventListener("change", () => {
    loadDataForDateRange(startDatePicker.value, endDatePicker.value);
  });
});

function loadDataForDateRange(startDate, endDate) {
  const sortSelect = document.getElementById("sort");
  const timeList = document.getElementById("time-list");
  timeList.innerHTML = ""; // Clear previous data

  browser.storage.local.get("dailyData").then((result) => {
    if (result.dailyData) {
      const dailyData = result.dailyData;

      // Aggregate data for the date range
      const aggregatedData = {};

      // Iterate through all dates in the range
      const currentDate = new Date(startDate);
      const endDateObj = new Date(endDate);

      while (currentDate <= endDateObj) {
        const dateStr = currentDate.toISOString().split("T")[0];

        if (dailyData[dateStr]) {
          for (const [domain, timeSpent] of Object.entries(dailyData[dateStr])) {
            if (!aggregatedData[domain]) {
              aggregatedData[domain] = 0;
            }
            aggregatedData[domain] += timeSpent;
          }
        }

        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
      }

      // Convert aggregated data to array for sorting
      const dataArray = Object.entries(aggregatedData);

      // Sort based on selected option
      if (sortSelect.value === "most-to-least") {
        dataArray.sort((a, b) => b[1] - a[1]); // Sort by time (descending)
      } else if (sortSelect.value === "alphabetical") {
        dataArray.sort((a, b) => a[0].localeCompare(b[0])); // Sort alphabetically
      }

      // Display sorted data with favicons
      dataArray.forEach(([domain, timeSpent]) => {
        const timeFormatted = formatTime(timeSpent);
        const li = document.createElement("li");

        // Create an image element for the favicon
        const img = document.createElement("img");
        img.src = `https://www.google.com/s2/favicons?domain=${domain}`;
        img.style.width = "16px";
        img.style.height = "16px";
        img.style.marginRight = "5px";

        // Create a span for the domain and time
        const span = document.createElement("span");
        span.textContent = `${domain}: ${timeFormatted}`;

        // Append the favicon and span to the list item
        li.appendChild(img);
        li.appendChild(span);

        // Append the list item to the time list
        timeList.appendChild(li);
      });
    } else {
      timeList.textContent = "No data for this date range.";
    }
  });
}

function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}