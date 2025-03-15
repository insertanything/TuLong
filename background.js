let activeTabId = null;
let startTime = null;
let dailyData = {};

// Load saved data from storage
browser.storage.local.get("dailyData").then((result) => {
  if (result.dailyData) {
    dailyData = result.dailyData;
  }
});

// Listen for tab activation
browser.tabs.onActivated.addListener((activeInfo) => {
  const now = Date.now();

  if (activeTabId !== null && startTime !== null) {
    // Calculate time spent on the previous tab
    const timeSpent = now - startTime;
    updateTime(activeTabId, timeSpent);
  }

  // Set the new active tab and start time
  activeTabId = activeInfo.tabId;
  startTime = now;
});

// Listen for tab updates (e.g., URL changes)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    const now = Date.now();

    if (startTime !== null) {
      // Calculate time spent on the previous URL
      const timeSpent = now - startTime;
      updateTime(activeTabId, timeSpent);
    }

    // Reset start time for the new URL
    startTime = now;
  }
});

// Update the time spent on a tab
function updateTime(tabId, timeSpent) {
  browser.tabs.get(tabId).then((tab) => {
    const domain = new URL(tab.url).hostname;
    const today = new Date().toISOString().split("T")[0];

    if (!dailyData[today]) {
      dailyData[today] = {};
    }

    if (!dailyData[today][domain]) {
      dailyData[today][domain] = 0;
    }

    dailyData[today][domain] += timeSpent;

    // Save updated data to storage
    browser.storage.local.set({ dailyData });
  });
}