const branches = ["Branch 1", "Branch 2", "Branch 3", "Branch 4"];
const serviceCentres = [
  "Service Center 1",
  "Service Center 2",
  "Service Center 3",
  "Service Center 4",
  "Service Center 5"
];
const complaintCategories = [
  "Sales Follow-up",
  "Vehicle Delivery",
  "Service Delay",
  "Warranty Claim",
  "Spare Part Issue",
  "Complimentary Concern",
  "Service Quality",
  "Documentation Error"
];
const statuses = ["Open", "In Progress", "Pending Customer", "Closed", "Escalated"];
const customerTypes = ["New", "Existing", "Corporate", "Fleet"];
const priorities = ["Low", "Medium", "High", "Critical"];
const slaStatuses = ["Compliant", "Near Miss", "Non-compliant"];
const followUpStates = ["Completed", "Pending", "Follow-up required", "Repeat complaint"];
const escalationLevels = ["Level 0", "Level 1", "Level 2", "Level 3"];
const owners = ["Asha Rao", "Ravi Menon", "Priya K", "Naveen B", "Meera D", "Karthik V"];

const state = {
  rows: [],
  filteredRows: [],
  sort: { key: "date", direction: "desc" },
  page: 1,
  pageSize: 10,
  sourceLabel: "Sample data"
};

function buildSampleRows(count) {
  const firstNames = ["Aarav", "Meera", "Rohit", "Nisha", "Sanjay", "Kavya", "Arjun", "Pooja", "Vikram", "Sonia"];
  const lastNames = ["Reddy", "Kumar", "Sharma", "Iyer", "Patel", "Joshi", "Nair", "Bhat", "Menon", "Rao"];
  const models = ["Innova Crysta", "Fortuner", "Corolla Altis", "Camry", "Etios", "Yaris", "Glanza", "Urban Cruiser Hyryder"];
  const descriptions = [
    "Delayed delivery and poor communication",
    "Repeated service reminder without resolution",
    "Noise during braking event",
    "Infotainment unit reboot issue",
    "AC cooling underperformed after service",
    "Battery warning recurring after check",
    "Unexpected vibration at highway speed",
    "Interior trim issue reported after purchase",
    "Spare part not available during promised date"
  ];
  const rows = [];

  for (let index = 0; index < count; index += 1) {
    const branch = branches[index % branches.length];
    const serviceCentre = serviceCentres[(index + (index % 3)) % serviceCentres.length];
    const category = complaintCategories[index % complaintCategories.length];
    const priority = priorities[(index + 1) % priorities.length];
    const status = statuses[(index + 2) % statuses.length];
    const customerType = customerTypes[index % customerTypes.length];
    const followUp = followUpStates[index % followUpStates.length];
    const customerName = `${firstNames[index % firstNames.length]} ${lastNames[(index + 3) % lastNames.length]}`;
    const date = new Date(2025, 8, 1 + (index % 30));
    const dayOffset = index % 6;
    date.setDate(date.getDate() + dayOffset);
    const responseTime = 10 + ((index * 3) % 18);
    const resolutionTime = 18 + ((index * 5) % 25);
    const csat = 3.4 + ((index % 11) * 0.2);
    const repeatComplaint = index % 7 === 0 || followUp === "Repeat complaint";
    const escalationLevel = repeatComplaint ? escalationLevels[(index + 2) % escalationLevels.length] : escalationLevels[index % 2];
    const slaStatus = responseTime > 20 ? "Non-compliant" : responseTime > 15 ? "Near Miss" : "Compliant";
    const statusLabel = status === "Closed" ? "Closed" : status === "Escalated" ? "Escalated" : status;

    rows.push({
      case_id: `HT-${String(index + 1001).padStart(4, "0")}`,
      date: date.toISOString().split("T")[0],
      customer_name: customerName,
      mobile_number: `+91${9000000000 + index}`,
      vehicle_registration_number: `TS${String(12 + (index % 88)).padStart(2, "0")} ${String(1000 + index).slice(-4)}`,
      vehicle_model: models[index % models.length],
      branch,
      service_centre: serviceCentre,
      complaint_category: category,
      complaint_description: descriptions[index % descriptions.length],
      priority,
      case_owner: owners[index % owners.length],
      status: statusLabel,
      sla_status: slaStatus,
      response_time: responseTime,
      resolution_time: resolutionTime,
      csat: csat.toFixed(1),
      escalation_level: escalationLevel,
      follow_up_status: followUp,
      customer_type: customerType,
      repeat_complaint: repeatComplaint ? "Yes" : "No"
    });
  }

  return rows;
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((header) => header.trim());
  const rows = [];

  for (let index = 1; index < lines.length; index += 1) {
    const values = lines[index].split(",");
    if (values.length !== headers.length) {
      continue;
    }

    const row = {};
    headers.forEach((header, headerIndex) => {
      row[header] = values[headerIndex].trim();
    });
    rows.push(row);
  }

  return rows;
}

function toCSV(rows) {
  const headers = [
    "case_id",
    "date",
    "customer_name",
    "mobile_number",
    "vehicle_registration_number",
    "vehicle_model",
    "branch",
    "service_centre",
    "complaint_category",
    "complaint_description",
    "priority",
    "case_owner",
    "status",
    "sla_status",
    "response_time",
    "resolution_time",
    "csat",
    "escalation_level",
    "follow_up_status",
    "customer_type",
    "repeat_complaint"
  ];

  const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const headerLine = headers.join(",");
  const rowLines = rows.map((row) => headers.map((header) => escape(row[header] ?? "")).join(","));
  return [headerLine, ...rowLines].join("\n");
}

function downloadCSV(rows) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "harsha-toyota-customer-care-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function safeNumber(value) {
  return Number(value) || 0;
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function getCutoffDate(period) {
  const latestDate = state.filteredRows.length
    ? new Date(Math.max(...state.filteredRows.map((row) => new Date(row.date).getTime())))
    : new Date();

  switch (period) {
    case "7":
      latestDate.setDate(latestDate.getDate() - 7);
      return latestDate;
    case "30":
      latestDate.setDate(latestDate.getDate() - 30);
      return latestDate;
    case "90":
      latestDate.setDate(latestDate.getDate() - 90);
      return latestDate;
    case "month":
      return new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
    case "year":
      return new Date(latestDate.getFullYear(), 0, 1);
    default:
      return new Date(0);
  }
}

function applyFilters() {
  const searchText = document.getElementById("searchInput").value.trim().toLowerCase();
  const datePeriod = document.getElementById("datePeriod").value;
  const branchValue = document.getElementById("branchFilter").value;
  const serviceValue = document.getElementById("serviceFilter").value;
  const categoryValue = document.getElementById("categoryFilter").value;
  const statusValue = document.getElementById("statusFilter").value;
  const customerTypeValue = document.getElementById("customerTypeFilter").value;
  const cutoff = getCutoffDate(datePeriod);

  const filtered = state.rows.filter((row) => {
    const rowDate = new Date(row.date);
    if (rowDate < cutoff) {
      return false;
    }
    if (branchValue && row.branch !== branchValue) {
      return false;
    }
    if (serviceValue && row.service_centre !== serviceValue) {
      return false;
    }
    if (categoryValue && row.complaint_category !== categoryValue) {
      return false;
    }
    if (statusValue && row.status !== statusValue) {
      return false;
    }
    if (customerTypeValue && row.customer_type !== customerTypeValue) {
      return false;
    }
    if (searchText) {
      const haystack = [row.case_id, row.customer_name, row.vehicle_registration_number, row.complaint_description, row.vehicle_model]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(searchText)) {
        return false;
      }
    }
    return true;
  });

  state.filteredRows = filtered;
  state.page = 1;
  render();
}

function sortRows(rows) {
  const { key, direction } = state.sort;
  const multiplier = direction === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    const first = a[key];
    const second = b[key];
    const firstValue = Number(first) || first;
    const secondValue = Number(second) || second;

    if (typeof firstValue === "number" && typeof secondValue === "number") {
      return (firstValue - secondValue) * multiplier;
    }

    return String(firstValue).localeCompare(String(secondValue)) * multiplier;
  });
}

function render() {
  const rows = sortRows(state.filteredRows);
  const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
  state.page = Math.min(state.page, totalPages);

  const start = (state.page - 1) * state.pageSize;
  const visibleRows = rows.slice(start, start + state.pageSize);

  renderKpis(rows);
  renderExecutiveSummary(rows);
  renderCharts(rows);
  renderCaseTable(visibleRows, rows.length);
  renderPagination(rows.length, totalPages);
}

function renderKpis(rows) {
  const openCases = rows.filter((row) => row.status !== "Closed").length;
  const closedCases = rows.filter((row) => row.status === "Closed").length;
  const resolvedToday = rows.filter((row) => row.status === "Closed").length;
  const avgResponse = average(rows.map((row) => safeNumber(row.response_time))).toFixed(1);
  const avgResolution = average(rows.map((row) => safeNumber(row.resolution_time))).toFixed(1);
  const slaCompliance = rows.length
    ? ((rows.filter((row) => row.sla_status === "Compliant").length / rows.length) * 100).toFixed(1)
    : "0.0";
  const csat = rows.length ? average(rows.map((row) => safeNumber(row.csat))).toFixed(1) : "0.0";
  const nps = Math.max(0, Math.round(safeNumber(csat) * 10 + 12));
  const escalations = rows.filter((row) => row.escalation_level !== "Level 0").length;
  const repeatComplaints = rows.filter((row) => row.repeat_complaint === "Yes").length;
  const fcr = rows.length ? ((rows.filter((row) => row.status === "Closed").length / rows.length) * 100).toFixed(1) : "0.0";
  const pendingFollowUps = rows.filter((row) => row.follow_up_status !== "Completed").length;
  const psf = rows.length ? ((rows.filter((row) => row.sla_status === "Compliant").length / rows.length) * 100).toFixed(1) : "0.0";

  const cards = [
    { label: "Total customer cases", value: rows.length, target: 180, previous: rows.length - 10, positive: true },
    { label: "Open cases", value: openCases, target: 30, previous: openCases + 3, positive: openCases < 30 },
    { label: "Closed cases", value: closedCases, target: 140, previous: closedCases - 4, positive: closedCases > 120 },
    { label: "Cases resolved today", value: resolvedToday, target: 24, previous: resolvedToday - 2, positive: resolvedToday >= 24 },
    { label: "Average response time", value: `${avgResponse} min`, target: "15 min", previous: `${(safeNumber(avgResponse) + 2).toFixed(1)} min`, positive: safeNumber(avgResponse) < 15 },
    { label: "Average resolution time", value: `${avgResolution} hrs`, target: "48 hrs", previous: `${(safeNumber(avgResolution) + 1).toFixed(1)} hrs`, positive: safeNumber(avgResolution) < 48 },
    { label: "SLA compliance %", value: `${slaCompliance}%`, target: "92%", previous: `${Math.max(0, safeNumber(slaCompliance) - 4).toFixed(1)}%`, positive: safeNumber(slaCompliance) >= 92 },
    { label: "CSAT score", value: `${csat}/5`, target: "4.4/5", previous: `${(safeNumber(csat) - 0.1).toFixed(1)}/5`, positive: safeNumber(csat) >= 4.4 },
    { label: "NPS score", value: nps, target: 58, previous: nps - 3, positive: nps >= 58 },
    { label: "Escalations", value: escalations, target: 12, previous: escalations + 1, positive: escalations <= 12 },
    { label: "Repeat complaints", value: repeatComplaints, target: 8, previous: repeatComplaints + 1, positive: repeatComplaints <= 8 },
    { label: "First-contact resolution %", value: `${fcr}%`, target: "78%", previous: `${Math.max(0, safeNumber(fcr) - 2).toFixed(1)}%`, positive: safeNumber(fcr) >= 78 },
    { label: "Pending follow-up cases", value: pendingFollowUps, target: 10, previous: pendingFollowUps + 1, positive: pendingFollowUps <= 10 },
    { label: "PSF completion %", value: `${psf}%`, target: "85%", previous: `${Math.max(0, safeNumber(psf) - 2).toFixed(1)}%`, positive: safeNumber(psf) >= 85 }
  ];

  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = cards
    .map((card) => {
      const delta = card.value === card.target || typeof card.value === "string" && card.value.includes("%") ? card.value : `${card.value - card.previous}`;
      const positive = card.positive ? "positive" : "negative";
      const icon = card.positive ? "▲" : "▼";
      return `
        <article class="kpi-card">
          <div class="label">${card.label}</div>
          <div class="value">${card.value}</div>
          <div class="kpi-meta">
            <span>Target: ${card.target}</span>
            <span class="kpi-trend ${positive}">${icon} ${delta}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderExecutiveSummary(rows) {
  const branchCounts = rows.reduce((acc, row) => {
    acc[row.branch] = (acc[row.branch] || 0) + 1;
    return acc;
  }, {});
  const topBranch = Object.entries(branchCounts).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
  const serviceScores = rows.reduce((acc, row) => {
    acc[row.service_centre] = acc[row.service_centre] || [];
    acc[row.service_centre].push(safeNumber(row.csat));
    return acc;
  }, {});
  const lowestService = Object.entries(serviceScores)
    .map(([name, scores]) => [name, average(scores)])
    .sort((a, b) => a[1] - b[1])[0] || ["N/A", 0];
  const categoryCounts = rows.reduce((acc, row) => {
    acc[row.complaint_category] = (acc[row.complaint_category] || 0) + 1;
    return acc;
  }, {});
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
  const slaNonCompliance = rows.filter((row) => row.sla_status === "Non-compliant").length;

  const cards = [
    { title: "Highest volume branch", value: topBranch[0], detail: `${topBranch[1]} active cases` },
    { title: "Lowest service centre CSAT", value: lowestService[0], detail: `${lowestService[1].toFixed(1)}/5` },
    { title: "Top complaint category", value: topCategory[0], detail: `${topCategory[1]} cases` },
    { title: "SLA non-compliance", value: slaNonCompliance, detail: `${((slaNonCompliance / Math.max(1, rows.length)) * 100).toFixed(1)}% of cases` }
  ];

  document.getElementById("executiveSummary").innerHTML = cards
    .map(
      (card) => `
        <div class="summary-card">
          <strong>${card.title}</strong>
          <div>${card.value}</div>
          <small>${card.detail}</small>
        </div>
      `
    )
    .join("");
}

function renderCharts(rows) {
  const sevenDayData = buildSevenDayTrend(rows);
  renderLineChart("chartSevenDay", sevenDayData.labels, sevenDayData.values, ["#c8102e", "#2563eb"]);

  const monthData = buildMonthlyTrend(rows);
  renderBarChart("chartMonthly", monthData.labels, monthData.values, "#c8102e");

  const openClosed = [
    { label: "Open", value: rows.filter((row) => row.status !== "Closed").length },
    { label: "Closed", value: rows.filter((row) => row.status === "Closed").length }
  ];
  renderDonutChart("chartOpenClosed", openClosed);

  renderBarChart("branchPerformance", buildCategorySeries(rows, "branch"), "#2563eb");
  renderBarChart("servicePerformance", buildServiceCsat(rows), "#2e8b57");
  renderBarChart("categoryAnalysis", buildCategorySeries(rows, "complaint_category"), "#c8102e");
  renderBarChart("sentimentAnalysis", buildSentimentSeries(rows), "#2563eb");
  renderBarChart("slaPerformance", buildSlaSeries(rows), "#2e8b57");
  renderBarChart("escalationMonitoring", buildEscalationSeries(rows), "#f59e0b");
  renderDonutChart("repeatAnalysis", [
    { label: "Repeat complaints", value: rows.filter((row) => row.repeat_complaint === "Yes").length },
    { label: "Other", value: rows.length - rows.filter((row) => row.repeat_complaint === "Yes").length }
  ]);
  renderBarChart("followUpStatus", buildFollowUpSeries(rows), "#2563eb");
  renderVoiceOfCustomer(rows);
  renderActionTracker(rows);
  renderManagementInsights(rows);
}

function buildSevenDayTrend(rows) {
  const labels = [];
  const values = [];
  const today = new Date();
  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const label = `${date.getDate()}`;
    labels.push(label);
    values.push(rows.filter((row) => row.date === date.toISOString().split("T")[0]).length);
  }
  return { labels, values };
}

function buildMonthlyTrend(rows) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const counts = new Array(6).fill(0);
  rows.forEach((row) => {
    const monthIndex = new Date(row.date).getMonth();
    const recentIndex = monthIndex >= new Date().getMonth() - 5 ? monthIndex - (new Date().getMonth() - 5) : 0;
    if (recentIndex >= 0 && recentIndex < 6) {
      counts[recentIndex] += 1;
    }
  });
  return { labels: months.slice(new Date().getMonth() - 5, new Date().getMonth() + 1), values: counts };
}

function buildCategorySeries(rows, key) {
  const aggregated = rows.reduce((acc, row) => {
    const bucket = row[key];
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(aggregated)
    .map(([label, value]) => ({ label, value }))
    .slice(0, 6);
}

function buildServiceCsat(rows) {
  const aggregated = rows.reduce((acc, row) => {
    acc[row.service_centre] = acc[row.service_centre] || [];
    acc[row.service_centre].push(safeNumber(row.csat));
    return acc;
  }, {});

  return Object.entries(aggregated)
    .map(([label, values]) => ({ label, value: average(values).toFixed(1) }))
    .slice(0, 6);
}

function buildSentimentSeries(rows) {
  const counts = {
    Positive: 0,
    Neutral: 0,
    Negative: 0
  };
  rows.forEach((row) => {
    const csat = safeNumber(row.csat);
    if (csat >= 4.3) {
      counts.Positive += 1;
    } else if (csat >= 3.8) {
      counts.Neutral += 1;
    } else {
      counts.Negative += 1;
    }
  });
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function buildSlaSeries(rows) {
  const counts = {
    Compliant: 0,
    "Near Miss": 0,
    "Non-compliant": 0
  };
  rows.forEach((row) => {
    counts[row.sla_status] += 1;
  });
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function buildEscalationSeries(rows) {
  const counts = rows.reduce((acc, row) => {
    acc[row.branch] = (acc[row.branch] || 0) + (row.escalation_level !== "Level 0" ? 1 : 0);
    return acc;
  }, {});
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function buildFollowUpSeries(rows) {
  const counts = rows.reduce((acc, row) => {
    acc[row.follow_up_status] = (acc[row.follow_up_status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function renderBarChart(containerId, items, accent) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const maxValue = Math.max(...items.map((item) => safeNumber(item.value)), 1);
  container.innerHTML = `
    <div class="bar-chart">
      ${items
        .map((item) => {
          const barHeight = Math.max(6, Math.round((safeNumber(item.value) / maxValue) * 100));
          return `
            <div class="bar-column">
              <div class="bar-fill" style="height:${barHeight}%; background:${accent};"></div>
              <div class="bar-label">${item.label}</div>
              <strong>${item.value}</strong>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderLineChart(containerId, labels, values, colors) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const width = 360;
  const height = 180;
  const padding = 24;
  const maxValue = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(1, values.length - 1);
    const y = height - padding - (value / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(" L ")}`;
  container.innerHTML = `
    <div class="line-chart">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Line chart">
        <path d="${linePath}" fill="none" stroke="${colors[0]}" stroke-width="3" />
      </svg>
      <div class="bar-label">${labels.join(" / ")}</div>
    </div>
  `;
}

function renderDonutChart(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const total = items.reduce((sum, item) => sum + safeNumber(item.value), 0);
  let offset = 0;
  const segments = items.map((item) => {
    const value = safeNumber(item.value);
    const percentage = total ? (value / total) * 100 : 0;
    const circumference = 2 * Math.PI * 40;
    const dash = (percentage / 100) * circumference;
    const segment = `<circle cx="60" cy="60" r="40" fill="transparent" stroke="${item.label === "Closed" || item.label === "Repeat complaints" || item.label === "Other" ? "#2e8b57" : "#c8102e"}" stroke-width="16" stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="-${offset}" transform="rotate(-90 60 60)"></circle>`;
    offset += dash;
    return segment;
  });
  container.innerHTML = `
    <div class="donut-chart">
      <svg width="140" height="140" viewBox="0 0 120 120">
        ${segments.join("")}
        <circle cx="60" cy="60" r="28" fill="#fff"></circle>
      </svg>
      <div class="bar-label">${items.map((item) => `${item.label}: ${item.value}`).join(" • ")}</div>
    </div>
  `;
}

function renderVoiceOfCustomer(rows) {
  const topFeedback = rows.slice(0, 5).map((row) => ({
    title: row.customer_name,
    detail: `${row.complaint_category} • ${row.complaint_description}`
  }));

  document.getElementById("voiceOfCustomer").innerHTML = topFeedback
    .map((item) => `
      <div class="list-item">
        <strong>${item.title}</strong>
        <div>${item.detail}</div>
      </div>
    `)
    .join("");
}

function renderActionTracker(rows) {
  const actions = [
    { issue: "Service delay", branch: "Branch 2", rootCause: "Parts unavailability", correctiveAction: "Daily stock review", owner: "Naveen B", dueDate: "2025-10-12", status: "In progress", remarks: "Escalation risk monitored" },
    { issue: "Repeat care calls", branch: "Service Center 4", rootCause: "Handover gap", correctiveAction: "Supervisor review", owner: "Meera D", dueDate: "2025-10-08", status: "Pending", remarks: "Customer retention risk" },
    { issue: "SLA misses", branch: "Branch 3", rootCause: "High volume peaks", correctiveAction: "Add overflow coverage", owner: "Ravi Menon", dueDate: "2025-10-14", status: "Planned", remarks: "Improve first response" }
  ];

  document.getElementById("actionTracker").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Issue</th>
          <th>Branch / centre</th>
          <th>Root cause</th>
          <th>Corrective action</th>
          <th>Owner</th>
          <th>Due date</th>
          <th>Status</th>
          <th>Management remarks</th>
        </tr>
      </thead>
      <tbody>
        ${actions
          .map(
            (action) => `
              <tr>
                <td>${action.issue}</td>
                <td>${action.branch}</td>
                <td>${action.rootCause}</td>
                <td>${action.correctiveAction}</td>
                <td>${action.owner}</td>
                <td>${action.dueDate}</td>
                <td>${action.status}</td>
                <td>${action.remarks}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderManagementInsights(rows) {
  const branchCounts = rows.reduce((acc, row) => {
    acc[row.branch] = (acc[row.branch] || 0) + 1;
    return acc;
  }, {});
  const topBranch = Object.entries(branchCounts).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
  const serviceScores = rows.reduce((acc, row) => {
    acc[row.service_centre] = acc[row.service_centre] || [];
    acc[row.service_centre].push(safeNumber(row.csat));
    return acc;
  }, {});
  const lowService = Object.entries(serviceScores)
    .map(([name, scores]) => [name, average(scores)])
    .sort((a, b) => a[1] - b[1])[0] || ["N/A", 0];
  const slaIssues = rows.filter((row) => row.sla_status === "Non-compliant").length;
  const escalations = rows.filter((row) => row.escalation_level !== "Level 0").length;
  const repeats = rows.filter((row) => row.repeat_complaint === "Yes").length;

  const insights = [
    `The highest complaint volume is in ${topBranch[0]} with ${topBranch[1]} cases in the selected window.`,
    `The lowest CSAT is observed at ${lowService[0]} with an average of ${lowService[1].toFixed(1)}/5.`,
    `SLA non-compliance remains visible in ${slaIssues} cases and should be reviewed with branch supervisors.`,
    `Escalation activity is trending upward with ${escalations} cases requiring senior intervention.`,
    `Repeat complaints account for ${repeats} cases and signal a need for deeper root cause analysis.`,
    "Recommended management action: prioritize service recovery outreach, branch-level coaching, and a daily review of high-risk tickets."
  ];

  document.getElementById("managementInsights").innerHTML = insights
    .map((insight) => `<div class="insight-item">${insight}</div>`)
    .join("");
}

function renderCaseTable(rows, totalRows) {
  const headers = [
    { key: "case_id", label: "Case ID" },
    { key: "date", label: "Date" },
    { key: "customer_name", label: "Customer" },
    { key: "mobile_number", label: "Mobile" },
    { key: "vehicle_registration_number", label: "Registration" },
    { key: "vehicle_model", label: "Model" },
    { key: "branch", label: "Branch" },
    { key: "service_centre", label: "Service centre" },
    { key: "complaint_category", label: "Category" },
    { key: "complaint_description", label: "Description" },
    { key: "priority", label: "Priority" },
    { key: "case_owner", label: "Owner" },
    { key: "status", label: "Status" },
    { key: "sla_status", label: "SLA" },
    { key: "response_time", label: "Response" },
    { key: "resolution_time", label: "Resolution" },
    { key: "csat", label: "CSAT" },
    { key: "escalation_level", label: "Escalation" },
    { key: "follow_up_status", label: "Follow-up" }
  ];

  const tbody = rows
    .map((row) => {
      const statusClass = row.status === "Closed" ? "closed" : row.status === "Escalated" ? "high" : row.status === "Pending Customer" ? "pending" : "open";
      const priorityClass = row.priority === "Critical" ? "high" : row.priority === "High" ? "high" : "open";
      return `
        <tr>
          <td>${row.case_id}</td>
          <td>${row.date}</td>
          <td>${row.customer_name}</td>
          <td>${row.mobile_number}</td>
          <td>${row.vehicle_registration_number}</td>
          <td>${row.vehicle_model}</td>
          <td>${row.branch}</td>
          <td>${row.service_centre}</td>
          <td>${row.complaint_category}</td>
          <td>${row.complaint_description}</td>
          <td><span class="badge ${priorityClass}">${row.priority}</span></td>
          <td>${row.case_owner}</td>
          <td><span class="badge ${statusClass}">${row.status}</span></td>
          <td>${row.sla_status}</td>
          <td>${row.response_time}m</td>
          <td>${row.resolution_time}h</td>
          <td>${row.csat}/5</td>
          <td>${row.escalation_level}</td>
          <td>${row.follow_up_status}</td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("caseTable").innerHTML = `
    <table>
      <thead>
        <tr>
          ${headers
            .map(
              (header) => `
                <th data-key="${header.key}">
                  ${header.label}
                </th>
              `
            )
            .join("")}
        </tr>
      </thead>
      <tbody>${tbody || '<tr><td colspan="19">No matching cases found.</td></tr>'}</tbody>
    </table>
  `;

  document.querySelectorAll("th[data-key]").forEach((header) => {
    header.addEventListener("click", () => {
      const key = header.getAttribute("data-key");
      state.sort = {
        key,
        direction: state.sort.key === key && state.sort.direction === "asc" ? "desc" : "asc"
      };
      render();
    });
  });

  const tableSection = document.getElementById("caseTable").closest(".section-card");
  const existingSummary = tableSection?.querySelector(".table-toolbar-summary");
  if (existingSummary) {
    existingSummary.remove();
  }

  document.getElementById("caseTable").insertAdjacentHTML("beforebegin", `
    <div class="table-toolbar-summary">
      <span>${totalRows} records shown</span>
    </div>
  `);
}

function renderPagination(totalRows, totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = `
    <button ${state.page === 1 ? "disabled" : ""} id="prevPage">Previous</button>
    <span>Page ${state.page} of ${totalPages}</span>
    <button ${state.page === totalPages ? "disabled" : ""} id="nextPage">Next</button>
  `;

  document.getElementById("prevPage")?.addEventListener("click", () => {
    if (state.page > 1) {
      state.page -= 1;
      render();
    }
  });

  document.getElementById("nextPage")?.addEventListener("click", () => {
    if (state.page < totalPages) {
      state.page += 1;
      render();
    }
  });
}

function populateFilters(rows) {
  const branchSelect = document.getElementById("branchFilter");
  const serviceSelect = document.getElementById("serviceFilter");
  const categorySelect = document.getElementById("categoryFilter");
  const statusSelect = document.getElementById("statusFilter");
  const customerTypeSelect = document.getElementById("customerTypeFilter");

  const branchOptions = [...new Set(rows.map((row) => row.branch))].sort();
  const serviceOptions = [...new Set(rows.map((row) => row.service_centre))].sort();
  const categoryOptions = [...new Set(rows.map((row) => row.complaint_category))].sort();
  const statusOptions = [...new Set(rows.map((row) => row.status))].sort();
  const customerTypeOptions = [...new Set(rows.map((row) => row.customer_type))].sort();

  branchSelect.innerHTML = ["", ...branchOptions].map((value) => `<option value="${value}">${value || "All branches"}</option>`).join("");
  serviceSelect.innerHTML = ["", ...serviceOptions].map((value) => `<option value="${value}">${value || "All centres"}</option>`).join("");
  categorySelect.innerHTML = ["", ...categoryOptions].map((value) => `<option value="${value}">${value || "All categories"}</option>`).join("");
  statusSelect.innerHTML = ["", ...statusOptions].map((value) => `<option value="${value}">${value || "All statuses"}</option>`).join("");
  customerTypeSelect.innerHTML = ["", ...customerTypeOptions].map((value) => `<option value="${value}">${value || "All types"}</option>`).join("");
}

function bindEvents() {
  document.getElementById("datePeriod").addEventListener("change", applyFilters);
  document.getElementById("branchFilter").addEventListener("change", applyFilters);
  document.getElementById("serviceFilter").addEventListener("change", applyFilters);
  document.getElementById("categoryFilter").addEventListener("change", applyFilters);
  document.getElementById("statusFilter").addEventListener("change", applyFilters);
  document.getElementById("customerTypeFilter").addEventListener("change", applyFilters);
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("datePeriod").value = "all";
    document.getElementById("branchFilter").value = "";
    document.getElementById("serviceFilter").value = "";
    document.getElementById("categoryFilter").value = "";
    document.getElementById("statusFilter").value = "";
    document.getElementById("customerTypeFilter").value = "";
    document.getElementById("searchInput").value = "";
    state.sort = { key: "date", direction: "desc" };
    applyFilters();
  });
  document.getElementById("refreshDashboard").addEventListener("click", async () => {
    await loadSampleData();
  });
  document.getElementById("downloadCsv").addEventListener("click", () => downloadCSV(state.filteredRows));
  document.getElementById("printDashboard").addEventListener("click", () => window.print());
  document.getElementById("csvUpload").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    const uploadedRows = parseCSV(text);
    if (uploadedRows.length) {
      state.rows = uploadedRows;
      state.filteredRows = uploadedRows;
      state.sourceLabel = file.name;
      populateFilters(state.rows);
      render();
      document.getElementById("lastUpdated").textContent = new Date().toLocaleString();
    }
  });
}

async function loadSampleData() {
  try {
    const response = await fetch("sample-data.csv");
    if (!response.ok) {
      throw new Error("Unable to fetch sample data");
    }
    const text = await response.text();
    const rows = parseCSV(text);
    if (rows.length) {
      state.rows = rows;
      state.filteredRows = rows;
      state.sourceLabel = "sample-data.csv";
      populateFilters(state.rows);
      render();
      document.getElementById("lastUpdated").textContent = new Date().toLocaleString();
      return;
    }
  } catch (error) {
    console.warn("Falling back to built-in sample data", error);
  }

  state.rows = buildSampleRows(120);
  state.filteredRows = state.rows;
  state.sourceLabel = "Built-in sample data";
  populateFilters(state.rows);
  render();
  document.getElementById("lastUpdated").textContent = new Date().toLocaleString();
}

function setDateDisplay() {
  const dateEl = document.getElementById("currentDate");
  const updatedEl = document.getElementById("lastUpdated");
  dateEl.textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  updatedEl.textContent = new Date().toLocaleString("en-IN");
}

function init() {
  setDateDisplay();
  bindEvents();
  loadSampleData();
}

document.addEventListener("DOMContentLoaded", init);
