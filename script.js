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
const owners = ["Asha Rao", "Ravi Menon", "Priya K", "Naveen B", "Meera D", "Karthik V"];

const FIELD_DEFINITIONS = {
  case_id: { labels: ["case id", "case_id", "caseid", "ticket id", "ticketid", "complaint id", "case number"], defaultValue: "Not Available" },
  date: { labels: ["date", "case date", "created date", "created on", "complaint date", "ticket date"], defaultValue: "Not Available" },
  customer_name: { labels: ["customer name", "customer_name", "customer", "name", "customername", "customer name(s)", "customer"], defaultValue: "Not Available" },
  mobile_number: { labels: ["mobile number", "mobile", "phone", "mobile no", "contact number", "contact"], defaultValue: "Not Available" },
  vehicle_registration_number: { labels: ["vehicle registration number", "registration number", "reg no", "vehicle reg no", "reg number", "vehicle registration", "vehicle number", "registration", "vehicle reg"], defaultValue: "Not Available" },
  vehicle_model: { labels: ["vehicle model", "model", "vehicle", "car model"], defaultValue: "Not Available" },
  branch: { labels: ["branch", "branch name", "sales branch", "dealer branch", "location", "branch location", "branchname"], defaultValue: "Not Available" },
  service_centre: { labels: ["service centre", "service center", "service_centre", "service center name", "service centre name", "workshop", "workshop name", "servicecentre", "servicecenter"], defaultValue: "Not Available" },
  complaint_category: { labels: ["complaint category", "category", "issue type", "reason", "complaint type", "complaintcategory"], defaultValue: "Not Available" },
  complaint_description: { labels: ["complaint description", "description", "issue description", "details", "remarks", "customer complaint"], defaultValue: "Not Available" },
  priority: { labels: ["priority", "urgency"], defaultValue: "Not Available" },
  case_owner: { labels: ["case owner", "owner", "assigned to", "case handler", "agent"], defaultValue: "Not Available" },
  status: { labels: ["case status", "status", "ticket status", "current status", "case state"], defaultValue: "Not Available" },
  sla_status: { labels: ["sla status", "sla"], defaultValue: "Not Available" },
  response_time: { labels: ["response time", "response time (minutes)", "response time (mins)", "response time minutes", "first response time", "response minutes", "response"], defaultValue: 0 },
  resolution_time: { labels: ["resolution time", "resolution time (hours)", "resolution time hours", "time to resolve", "resolution hours", "resolution"], defaultValue: 0 },
  csat: { labels: ["csat score", "csat", "customer satisfaction score", "customer satisfaction"], defaultValue: 0 },
  nps: { labels: ["nps score", "nps", "net promoter score"], defaultValue: 0 },
  escalation_level: { labels: ["escalation level", "escalation"], defaultValue: "Level 0" },
  follow_up_status: { labels: ["follow up status", "follow-up status", "follow up", "followup"], defaultValue: "Pending" },
  customer_type: { labels: ["customer type", "customer_type", "customer segment"], defaultValue: "Unknown" },
  repeat_complaint: { labels: ["repeat complaint", "repeat_complaint", "repeat"], defaultValue: "No" }
};

const REQUIRED_FIELDS = ["case_id", "date", "customer_name", "branch", "service_centre", "vehicle_registration_number", "vehicle_model"];

const state = {
  rows: [],
  filteredRows: [],
  sort: { key: "date", direction: "desc" },
  page: 1,
  pageSize: 10,
  sourceLabel: "Sample data",
  validationReport: null,
  headerMappings: []
};

function isBlankish(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "number") return Number.isNaN(value);
  const text = String(value).trim().toLowerCase();
  return text === "" || ["undefined", "null", "nan", "n/a", "na", "not available", "not assigned"].includes(text);
}

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/centre/g, "center")
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeSheetName(value) {
  return normalizeHeader(value).replace(/sheet/g, "");
}

function headerMatchesAlias(header, alias) {
  const normalizedHeader = normalizeHeader(header);
  const normalizedAlias = normalizeHeader(alias);
  if (!normalizedHeader || !normalizedAlias) return false;
  return normalizedHeader === normalizedAlias || normalizedHeader.includes(normalizedAlias) || normalizedAlias.includes(normalizedHeader);
}

function cleanText(value, fallback = "Not Available") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
}

function safeNumber(value, fallback = 0) {
  if (isBlankish(value)) return fallback;
  const numericValue = Number(String(value).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function average(values) {
  const filtered = values.filter((value) => Number.isFinite(Number(value)));
  return filtered.length ? filtered.reduce((sum, value) => sum + Number(value), 0) / filtered.length : 0;
}

function toDisplayValue(value, fallback = "Not Available") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function normalizeDate(value) {
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  if (typeof value === "number") {
    const date = new Date((value - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
}

function normalizeStatus(value) {
  if (isBlankish(value)) return "Not Available";
  const text = String(value).trim().toLowerCase();
  if (text.includes("close")) return "Closed";
  if (text.includes("escal")) return "Escalated";
  if (text.includes("progress")) return "In Progress";
  if (text.includes("pending")) return "Pending Customer";
  if (text.includes("open")) return "Open";
  return cleanText(value, "Not Available");
}

function normalizePriority(value) {
  if (isBlankish(value)) return "Not Available";
  const text = String(value).trim().toLowerCase();
  if (text.includes("critical")) return "Critical";
  if (text.includes("high")) return "High";
  if (text.includes("low")) return "Low";
  return cleanText(value, "Not Available");
}

function normalizeSlaStatus(value) {
  if (isBlankish(value)) return "Not Available";
  const text = String(value).trim().toLowerCase();
  if (text.includes("non")) return "Non-compliant";
  if (text.includes("near")) return "Near Miss";
  if (text.includes("compliant")) return "Compliant";
  return cleanText(value, "Not Available");
}

function normalizeRepeatComplaint(value) {
  if (isBlankish(value)) return "No";
  const text = String(value).trim().toLowerCase();
  if (["yes", "true", "1", "repeat"].includes(text)) return "Yes";
  return "No";
}

function normalizeEscalation(value) {
  const text = String(value ?? "").trim();
  if (!text || isBlankish(value)) return "Level 0";
  if (/^level/i.test(text)) return text;
  return `Level ${text}`;
}

function isCompletelyEmptyRow(row) {
  if (!row) return true;
  return !Object.values(row).some((value) => {
    if (value === null || value === undefined) return false;
    const text = String(value).trim();
    return text !== "" && !["undefined", "null", "nan", "n/a", "na"].includes(text.toLowerCase());
  });
}

function buildValidationReport(rawRows, normalizedRows, sourceLabel) {
  const headers = new Set();
  rawRows.forEach((row) => Object.keys(row || {}).forEach((key) => headers.add(key)));

  const missingColumns = REQUIRED_FIELDS.filter((field) => {
    return !Array.from(headers).some((header) => FIELD_DEFINITIONS[field].labels.some((alias) => headerMatchesAlias(header, alias)));
  });

  const invalidRows = [];
  rawRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const missingFields = REQUIRED_FIELDS.filter((field) => {
      const value = normalizeFieldValue(row, field, FIELD_DEFINITIONS[field].defaultValue);
      return isBlankish(value) || value === FIELD_DEFINITIONS[field].defaultValue;
    });
    if (missingFields.length) {
      invalidRows.push({ rowNumber, missingFields });
    }
  });

  return {
    sourceLabel,
    totalRows: rawRows.length,
    normalizedRows: normalizedRows.length,
    ignoredRows: Math.max(0, rawRows.length - normalizedRows.length),
    missingColumns,
    invalidRows,
    warnings: [
      ...(missingColumns.length ? [`Missing required columns: ${missingColumns.join(", ")}`] : []),
      ...(invalidRows.length ? [`${invalidRows.length} row(s) contain missing required values`] : [])
    ]
  };
}

function prepareRows(rawRows, sourceLabel) {
  const meaningfulRows = rawRows.filter((row) => !isCompletelyEmptyRow(row));
  const normalizedRows = meaningfulRows.map((row, index) => buildNormalizedRow(row, index));
  return {
    rows: normalizedRows,
    validationReport: buildValidationReport(rawRows, normalizedRows, sourceLabel)
  };
}

function normalizeFieldValue(rawRow, fieldName, fallback) {
  const config = FIELD_DEFINITIONS[fieldName];
  const matchedKey = Object.keys(rawRow || {}).find((key) => config.labels.some((alias) => headerMatchesAlias(key, alias)));

  if (matchedKey && rawRow[matchedKey] !== undefined && rawRow[matchedKey] !== null) {
    const rawValue = rawRow[matchedKey];
    if (isBlankish(rawValue)) return fallback;
    if (fieldName === "date") return normalizeDate(rawValue);
    if (fieldName === "response_time" || fieldName === "resolution_time") return safeNumber(rawValue, 0);
    if (fieldName === "csat" || fieldName === "nps") return safeNumber(rawValue, 0);
    if (fieldName === "priority") return normalizePriority(rawValue);
    if (fieldName === "status") return normalizeStatus(rawValue);
    if (fieldName === "sla_status") return normalizeSlaStatus(rawValue);
    if (fieldName === "repeat_complaint") return normalizeRepeatComplaint(rawValue);
    if (fieldName === "escalation_level") return normalizeEscalation(rawValue);
    if (fieldName === "customer_type") return cleanText(rawValue, "Unknown");
    if (typeof rawValue === "boolean") return rawValue ? "Yes" : "No";
    return cleanText(rawValue, fallback);
  }
  return fallback;
}

function scoreHeaderRow(row) {
  return (row || []).reduce((score, cell) => {
    if (cell === null || cell === undefined) return score;
    const normalizedCell = normalizeHeader(cell);
    if (!normalizedCell) return score;
    const matchedFields = Object.keys(FIELD_DEFINITIONS).filter((fieldName) => FIELD_DEFINITIONS[fieldName].labels.some((alias) => headerMatchesAlias(cell, alias)));
    return score + (matchedFields.length ? 1 : 0);
  }, 0);
}

function buildHeaderMapping(headers) {
  return Object.keys(FIELD_DEFINITIONS).reduce((mapping, fieldName) => {
    const matchedHeader = headers.find((header) => FIELD_DEFINITIONS[fieldName].labels.some((alias) => headerMatchesAlias(header, alias)));
    if (matchedHeader) {
      mapping[fieldName] = matchedHeader;
    }
    return mapping;
  }, {});
}

function logHeaderMapping(sheetName, mapping) {
  const entries = Object.entries(mapping).map(([fieldName, header]) => ({ internalField: fieldName, excelColumn: header || "—" }));
  console.groupCollapsed(`Workbook mapping :: ${sheetName}`);
  console.table(entries);
  console.log("Detected worksheet:", sheetName);
  console.groupEnd();
}

function logWorkbookDiagnostics(workbook, detectedSheet) {
  const sheetSummaries = (workbook.SheetNames || []).map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const headerRowIndex = findHeaderRowIndex(sheetRows);
    const headerRow = headerRowIndex >= 0 ? sheetRows[headerRowIndex] : [];
    return {
      sheetName,
      headerRowIndex,
      headerScore: scoreHeaderRow(headerRow),
      headerRow: headerRow.slice(0, 12)
    };
  });
  console.groupCollapsed("Workbook sheet audit");
  console.table(sheetSummaries.map(({ sheetName, headerRowIndex, headerScore }) => ({ sheetName, headerRowIndex, headerScore })));
  console.log("Selected worksheet:", detectedSheet.sheetName);
  console.log("Selected headers:", detectedSheet.headerRow || []);
  console.groupEnd();
}

function detectCaseDataSheet(workbook) {
  const sheetNames = workbook.SheetNames || [];
  const exactCustomerSheet = sheetNames.find((sheetName) => normalizeSheetName(sheetName) === "customercases");
  if (exactCustomerSheet) {
    const sheet = workbook.Sheets[exactCustomerSheet];
    const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const headerRowIndex = findHeaderRowIndex(sheetRows);
    const headerRow = headerRowIndex >= 0 ? sheetRows[headerRowIndex] : [];
    return {
      sheetName: exactCustomerSheet,
      sheet,
      sheetRows,
      headerRowIndex,
      headerScore: scoreHeaderRow(headerRow),
      combinedScore: 999,
      headerRow,
      dataRowCount: Math.max(0, sheetRows.length - headerRowIndex - 1)
    };
  }

  const sheetCandidates = sheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const headerRowIndex = findHeaderRowIndex(sheetRows);
    const detectedHeader = headerRowIndex >= 0 ? sheetRows[headerRowIndex] : [];
    const headerScore = scoreHeaderRow(detectedHeader);
    const sheetNameHint = /case|complaint|customer|service|ticket|data/.test(normalizeHeader(sheetName)) ? 3 : 0;
    const dataRowCount = Math.max(0, sheetRows.length - headerRowIndex - 1);
    const combinedScore = headerScore * 3 + sheetNameHint + (dataRowCount > 0 ? 1 : 0);
    return {
      sheetName,
      sheet,
      sheetRows,
      headerRowIndex,
      headerScore,
      combinedScore,
      headerRow: detectedHeader,
      dataRowCount
    };
  }).filter((candidate) => candidate.headerScore > 0 || candidate.combinedScore > 0);

  const bestSheet = sheetCandidates.sort((a, b) => b.combinedScore - a.combinedScore || b.dataRowCount - a.dataRowCount)[0];
  return bestSheet || { sheetName: sheetNames[0], sheet: workbook.Sheets[sheetNames[0]], sheetRows: [], headerRowIndex: 0, headerScore: 0, combinedScore: 0, headerRow: [], dataRowCount: 0 };
}

function findHeaderRowIndex(sheetRows) {
  let bestRowIndex = 0;
  let bestScore = 0;
  sheetRows.forEach((row, index) => {
    const score = scoreHeaderRow(row);
    if (score > bestScore) {
      bestScore = score;
      bestRowIndex = index;
    }
  });
  return bestScore > 0 ? bestRowIndex : 0;
}

function buildRowsFromSheet(sheet, sheetName) {
  const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const headerRowIndex = findHeaderRowIndex(sheetRows);
  const headerRow = headerRowIndex >= 0 ? sheetRows[headerRowIndex] : [];
  const headers = (headerRow || []).map((value) => String(value ?? "").trim());
  const dataRows = (sheetRows.slice(headerRowIndex + 1) || []).map((values) => {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  }).filter((row) => !isCompletelyEmptyRow(row));
  const mapping = buildHeaderMapping(headers);
  const missingRequiredFields = REQUIRED_FIELDS.filter((fieldName) => !mapping[fieldName]);
  state.headerMappings = Object.entries(mapping).map(([fieldName, header]) => ({ internalField: fieldName, excelColumn: header || "—" }));
  logHeaderMapping(sheetName, mapping);
  if (missingRequiredFields.length) {
    const message = `Missing required columns: ${missingRequiredFields.join(", ")}`;
    console.error(message);
    alert(message);
    throw new Error(message);
  }
  return dataRows;
}

function buildNormalizedRow(rawRow, index) {
  const baseRow = {};
  Object.keys(FIELD_DEFINITIONS).forEach((fieldName) => {
    const fallback = FIELD_DEFINITIONS[fieldName].defaultValue;
    baseRow[fieldName] = normalizeFieldValue(rawRow, fieldName, fallback);
  });
  if (!baseRow.case_id || baseRow.case_id === "Not Available") {
    baseRow.case_id = `HT-${String(index + 1001).padStart(4, "0")}`;
  }
  if (isBlankish(baseRow.date)) {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() - (index % 30));
    baseRow.date = defaultDate.toISOString().split("T")[0];
  }
  if (isBlankish(baseRow.branch)) {
    baseRow.branch = "Not Available";
  }
  if (isBlankish(baseRow.service_centre)) {
    baseRow.service_centre = "Not Available";
  }
  baseRow.serviceCentre = baseRow.service_centre;
  baseRow.customerName = baseRow.customer_name;
  baseRow.registration = baseRow.vehicle_registration_number;
  if (baseRow.nps === 0 || baseRow.nps === "0" || baseRow.nps === "Not Available") {
    const csat = safeNumber(baseRow.csat, 0);
    baseRow.nps = Math.max(0, Math.round(csat * 10 + 12));
  }
  if (baseRow.csat === 0 || baseRow.csat === "0" || baseRow.csat === "Not Available") {
    baseRow.csat = 4.0;
  }
  if (baseRow.response_time === 0) {
    baseRow.response_time = 12 + (index % 10);
  }
  if (baseRow.resolution_time === 0) {
    baseRow.resolution_time = 18 + (index % 12);
  }
  if (baseRow.sla_status === "Not Available") {
    baseRow.sla_status = safeNumber(baseRow.response_time, 0) > 20 ? "Non-compliant" : safeNumber(baseRow.response_time, 0) > 15 ? "Near Miss" : "Compliant";
  }
  return baseRow;
}

function normalizeRows(rawRows) {
  return rawRows.map((row, index) => buildNormalizedRow(row, index));
}

function parseCSV(text) {
  const rows = [];
  const lines = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (inQuotes && text[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      current += char;
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      if (current.trim() || lines.length) {
        lines.push(current);
      }
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((header) => header.trim().replace(/^"|"$/g, ""));
  lines.slice(1).forEach((line) => {
    const values = [];
    let currentValue = "";
    let quoteMode = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"') {
        quoteMode = !quoteMode;
      } else if (char === "," && !quoteMode) {
        values.push(currentValue.trim().replace(/^"|"$/g, ""));
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^"|"$/g, ""));
    if (values.every((value) => value !== "")) {
      const row = {};
      headers.forEach((header, headerIndex) => {
        row[header] = values[headerIndex] ?? "";
      });
      rows.push(row);
    }
  });
  return rows;
}

async function parseUploadedFile(file) {
  const extension = file.name.toLowerCase();
  if (extension.endsWith(".csv")) {
    const text = await file.text();
    const rows = parseCSV(text);
    state.headerMappings = Object.keys(rows[0] || {}).map((header) => ({ internalField: "—", excelColumn: header }));
    return rows;
  }
  if (extension.endsWith(".xlsx") || extension.endsWith(".xls") || extension.endsWith(".xlsm")) {
    if (!window.XLSX) {
      throw new Error("Excel support is unavailable because the library did not load.");
    }
    const data = await file.arrayBuffer();
    const workbook = window.XLSX.read(data, { type: "array" });
    const detectedSheet = detectCaseDataSheet(workbook);
    const detectedColumnNames = detectedSheet.headerRow || [];
    const importedRows = buildRowsFromSheet(detectedSheet.sheet, detectedSheet.sheetName);
    console.log("Selected worksheet name:", detectedSheet.sheetName);
    console.log("Header row detected:", detectedSheet.headerRow || []);
    console.log("Complete array of detected column names:", detectedColumnNames);
    console.log("First imported record:", importedRows[0] || null);
    logWorkbookDiagnostics(workbook, detectedSheet);
    return importedRows;
  }
  return [];
}

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
    const followUp = index % 5 === 0 ? "Repeat complaint" : "Completed";
    const customerName = `${firstNames[index % firstNames.length]} ${lastNames[(index + 3) % lastNames.length]}`;
    const date = new Date();
    date.setDate(date.getDate() - (index % 30));
    rows.push(buildNormalizedRow({
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
      status,
      sla_status: safeNumber(12 + (index % 10)) > 15 ? "Near Miss" : "Compliant",
      response_time: 10 + ((index * 3) % 18),
      resolution_time: 18 + ((index * 5) % 25),
      csat: 3.4 + ((index % 11) * 0.2),
      nps: 45 + (index % 12) * 2,
      escalation_level: index % 6 === 0 ? "Level 2" : "Level 0",
      follow_up_status: followUp,
      customer_type: customerType,
      repeat_complaint: followUp === "Repeat complaint" ? "Yes" : "No"
    }, index));
  }
  return rows;
}

function toCSV(rows) {
  const headers = ["case_id", "date", "customer_name", "mobile_number", "vehicle_registration_number", "vehicle_model", "branch", "service_centre", "complaint_category", "complaint_description", "priority", "case_owner", "status", "sla_status", "response_time", "resolution_time", "csat", "nps", "escalation_level", "follow_up_status", "customer_type", "repeat_complaint"];
  const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header] ?? "")).join(","))].join("\n");
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

function getRowValue(row, fieldName, fallback = "") {
  const value = row?.[fieldName];
  if (value === undefined || value === null || value === "") return fallback;
  return value;
}

function getText(row, fieldName, fallback = "Not Available") {
  return toDisplayValue(getRowValue(row, fieldName, fallback), fallback);
}

function getNumber(row, fieldName, fallback = 0) {
  return safeNumber(getRowValue(row, fieldName, fallback), fallback);
}

function getCutoffDate(period) {
  const latestDate = state.filteredRows.length ? new Date(Math.max(...state.filteredRows.map((row) => new Date(getText(row, "date", "2000-01-01")).getTime()))) : new Date();
  switch (period) {
    case "7": latestDate.setDate(latestDate.getDate() - 7); return latestDate;
    case "30": latestDate.setDate(latestDate.getDate() - 30); return latestDate;
    case "90": latestDate.setDate(latestDate.getDate() - 90); return latestDate;
    case "month": return new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
    case "year": return new Date(latestDate.getFullYear(), 0, 1);
    default: return new Date(0);
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
    const rowDate = new Date(getText(row, "date", "2000-01-01"));
    if (rowDate < cutoff) return false;
    if (branchValue && getText(row, "branch") !== branchValue) return false;
    if (serviceValue && getText(row, "service_centre") !== serviceValue) return false;
    if (categoryValue && getText(row, "complaint_category") !== categoryValue) return false;
    if (statusValue && getText(row, "status") !== statusValue) return false;
    if (customerTypeValue && getText(row, "customer_type") !== customerTypeValue) return false;
    if (searchText) {
      const haystack = [getText(row, "case_id"), getText(row, "customer_name"), getText(row, "vehicle_registration_number"), getText(row, "complaint_description"), getText(row, "vehicle_model")].join(" ").toLowerCase();
      if (!haystack.includes(searchText)) return false;
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
    const firstValue = a[key];
    const secondValue = b[key];
    const firstNumber = Number(firstValue);
    const secondNumber = Number(secondValue);
    if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber)) return (firstNumber - secondNumber) * multiplier;
    return String(firstValue ?? "").localeCompare(String(secondValue ?? "")) * multiplier;
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
  renderValidationReport();
}

function renderKpis(rows) {
  const openCases = rows.filter((row) => getText(row, "status") !== "Closed").length;
  const closedCases = rows.filter((row) => getText(row, "status") === "Closed").length;
  const pendingCases = rows.filter((row) => getText(row, "status") === "Pending Customer" || getText(row, "status") === "Not Available").length;
  const escalatedCases = rows.filter((row) => getText(row, "status") === "Escalated").length;
  const avgResponse = average(rows.map((row) => getNumber(row, "response_time"))).toFixed(1);
  const avgResolution = average(rows.map((row) => getNumber(row, "resolution_time"))).toFixed(1);
  const slaCompliance = rows.length ? ((rows.filter((row) => getText(row, "sla_status") === "Compliant").length / rows.length) * 100).toFixed(1) : "0.0";
  const csat = rows.length ? average(rows.map((row) => getNumber(row, "csat"))).toFixed(1) : "0.0";
  const nps = rows.length ? Math.max(0, Math.round(average(rows.map((row) => getNumber(row, "nps"))))) : 0;
  const escalations = rows.filter((row) => getText(row, "escalation_level") !== "Level 0").length;
  const repeatComplaints = rows.filter((row) => getText(row, "repeat_complaint") === "Yes").length;
  const fcr = rows.length ? ((rows.filter((row) => getText(row, "status") === "Closed").length / rows.length) * 100).toFixed(1) : "0.0";
  const pendingFollowUps = rows.filter((row) => getText(row, "follow_up_status") !== "Completed").length;
  const psf = rows.length ? ((rows.filter((row) => getText(row, "sla_status") === "Compliant").length / rows.length) * 100).toFixed(1) : "0.0";
  const cards = [
    { label: "Total customer cases", value: rows.length, target: 180, previous: Math.max(0, rows.length - 10), positive: true },
    { label: "Open cases", value: openCases, target: 30, previous: Math.max(0, openCases + 3), positive: openCases < 30 },
    { label: "Closed cases", value: closedCases, target: 140, previous: Math.max(0, closedCases - 4), positive: closedCases > 120 },
    { label: "Pending cases", value: pendingCases, target: 20, previous: Math.max(0, pendingCases + 2), positive: pendingCases <= 20 },
    { label: "Escalated cases", value: escalatedCases, target: 8, previous: Math.max(0, escalatedCases + 1), positive: escalatedCases <= 8 },
    { label: "Cases resolved today", value: closedCases, target: 24, previous: Math.max(0, closedCases - 2), positive: closedCases >= 24 },
    { label: "Average response time", value: `${avgResponse} min`, target: "15 min", previous: `${(safeNumber(avgResponse) + 2).toFixed(1)} min`, positive: safeNumber(avgResponse) < 15 },
    { label: "Average resolution time", value: `${avgResolution} hrs`, target: "48 hrs", previous: `${(safeNumber(avgResolution) + 1).toFixed(1)} hrs`, positive: safeNumber(avgResolution) < 48 },
    { label: "SLA compliance %", value: `${slaCompliance}%`, target: "92%", previous: `${Math.max(0, safeNumber(slaCompliance) - 4).toFixed(1)}%`, positive: safeNumber(slaCompliance) >= 92 },
    { label: "CSAT score", value: `${csat}/5`, target: "4.4/5", previous: `${(safeNumber(csat) - 0.1).toFixed(1)}/5`, positive: safeNumber(csat) >= 4.4 },
    { label: "NPS score", value: nps, target: 58, previous: Math.max(0, nps - 3), positive: nps >= 58 },
    { label: "Escalations", value: escalations, target: 12, previous: Math.max(0, escalations + 1), positive: escalations <= 12 },
    { label: "Repeat complaints", value: repeatComplaints, target: 8, previous: Math.max(0, repeatComplaints + 1), positive: repeatComplaints <= 8 },
    { label: "First-contact resolution %", value: `${fcr}%`, target: "78%", previous: `${Math.max(0, safeNumber(fcr) - 2).toFixed(1)}%`, positive: safeNumber(fcr) >= 78 },
    { label: "Pending follow-up cases", value: pendingFollowUps, target: 10, previous: Math.max(0, pendingFollowUps + 1), positive: pendingFollowUps <= 10 },
    { label: "PSF completion %", value: `${psf}%`, target: "85%", previous: `${Math.max(0, safeNumber(psf) - 2).toFixed(1)}%`, positive: safeNumber(psf) >= 85 }
  ];
  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = cards.map((card) => {
    const hasPercent = typeof card.value === "string" && card.value.includes("%") || typeof card.target === "string" && card.target.includes("%");
    const deltaValue = hasPercent ? card.value : `${card.value - card.previous}`;
    const positive = card.positive ? "positive" : "negative";
    const icon = card.positive ? "▲" : "▼";
    return `<article class="kpi-card"><div class="label">${card.label}</div><div class="value">${card.value}</div><div class="kpi-meta"><span>Target: ${card.target}</span><span class="kpi-trend ${positive}">${icon} ${deltaValue}</span></div></article>`;
  }).join("");
}

function renderExecutiveSummary(rows) {
  const branchCounts = rows.reduce((acc, row) => { const branch = getText(row, "branch", "Unassigned"); acc[branch] = (acc[branch] || 0) + 1; return acc; }, {});
  const topBranch = Object.entries(branchCounts).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
  const serviceScores = rows.reduce((acc, row) => { const serviceCentre = getText(row, "service_centre", "Unassigned"); acc[serviceCentre] = acc[serviceCentre] || []; acc[serviceCentre].push(getNumber(row, "csat", 0)); return acc; }, {});
  const lowestService = Object.entries(serviceScores).map(([name, scores]) => [name, average(scores)]).sort((a, b) => a[1] - b[1])[0] || ["N/A", 0];
  const categoryCounts = rows.reduce((acc, row) => { const category = getText(row, "complaint_category", "Uncategorized"); acc[category] = (acc[category] || 0) + 1; return acc; }, {});
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
  const slaNonCompliance = rows.filter((row) => getText(row, "sla_status") === "Non-compliant").length;
  const cards = [
    { title: "Highest volume branch", value: topBranch[0], detail: `${topBranch[1]} active cases` },
    { title: "Lowest service centre CSAT", value: lowestService[0], detail: `${lowestService[1].toFixed(1)}/5` },
    { title: "Top complaint category", value: topCategory[0], detail: `${topCategory[1]} cases` },
    { title: "SLA non-compliance", value: slaNonCompliance, detail: `${((slaNonCompliance / Math.max(1, rows.length)) * 100).toFixed(1)}% of cases` }
  ];
  document.getElementById("executiveSummary").innerHTML = cards.map((card) => `<div class="summary-card"><strong>${card.title}</strong><div>${card.value}</div><small>${card.detail}</small></div>`).join("");
}

function renderCharts(rows) {
  const sevenDayData = buildSevenDayTrend(rows);
  renderLineChart("chartSevenDay", sevenDayData.labels, sevenDayData.values, ["#c8102e", "#2563eb"]);
  const monthData = buildMonthlyTrend(rows);
  renderBarChart("chartMonthly", monthData.labels, monthData.values, "#c8102e");
  const openClosed = [
    { label: "Open", value: rows.filter((row) => getText(row, "status") !== "Closed").length },
    { label: "Closed", value: rows.filter((row) => getText(row, "status") === "Closed").length }
  ];
  renderDonutChart("chartOpenClosed", openClosed);
  renderBarChart("branchPerformance", buildCategorySeries(rows, "branch"), "#2563eb");
  renderBarChart("servicePerformance", buildServiceCsat(rows), "#2e8b57");
  renderBarChart("categoryAnalysis", buildCategorySeries(rows, "complaint_category"), "#c8102e");
  renderBarChart("sentimentAnalysis", buildSentimentSeries(rows), "#2563eb");
  renderBarChart("slaPerformance", buildSlaSeries(rows), "#2e8b57");
  renderBarChart("escalationMonitoring", buildEscalationSeries(rows), "#f59e0b");
  renderDonutChart("repeatAnalysis", [
    { label: "Repeat complaints", value: rows.filter((row) => getText(row, "repeat_complaint") === "Yes").length },
    { label: "Other", value: Math.max(0, rows.length - rows.filter((row) => getText(row, "repeat_complaint") === "Yes").length) }
  ]);
  renderBarChart("followUpStatus", buildFollowUpSeries(rows), "#2563eb");
  renderVoiceOfCustomer(rows);
  renderActionTracker();
  renderManagementInsights(rows);
}

function buildSevenDayTrend(rows) {
  const labels = [];
  const values = [];
  const today = new Date();
  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    labels.push(`${date.getDate()}`);
    values.push(rows.filter((row) => getText(row, "date", "") === date.toISOString().split("T")[0]).length);
  }
  return { labels, values };
}

function buildMonthlyTrend(rows) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const counts = new Array(6).fill(0);
  rows.forEach((row) => {
    const date = new Date(getText(row, "date", ""));
    if (Number.isNaN(date.getTime())) return;
    const monthIndex = date.getMonth();
    const offset = monthIndex - currentMonth;
    if (offset >= -5 && offset <= 0) counts[5 + offset] += 1;
  });
  const labels = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
  return { labels, values: counts };
}

function buildCategorySeries(rows, key) {
  const aggregated = rows.reduce((acc, row) => { const bucket = getText(row, key); acc[bucket] = (acc[bucket] || 0) + 1; return acc; }, {});
  return Object.entries(aggregated).map(([label, value]) => ({ label, value })).slice(0, 6);
}

function buildServiceCsat(rows) {
  const aggregated = rows.reduce((acc, row) => { const serviceCentre = getText(row, "service_centre", "Unassigned"); acc[serviceCentre] = acc[serviceCentre] || []; acc[serviceCentre].push(getNumber(row, "csat", 0)); return acc; }, {});
  return Object.entries(aggregated).map(([label, values]) => ({ label, value: average(values).toFixed(1) })).slice(0, 6);
}

function buildSentimentSeries(rows) {
  const counts = { Positive: 0, Neutral: 0, Negative: 0 };
  rows.forEach((row) => { const csat = getNumber(row, "csat", 0); if (csat >= 4.3) counts.Positive += 1; else if (csat >= 3.8) counts.Neutral += 1; else counts.Negative += 1; });
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function buildSlaSeries(rows) {
  const counts = { Compliant: 0, "Near Miss": 0, "Non-compliant": 0 };
  rows.forEach((row) => { const status = getText(row, "sla_status"); counts[status] = (counts[status] || 0) + 1; });
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function buildEscalationSeries(rows) {
  const counts = rows.reduce((acc, row) => { const branch = getText(row, "branch", "Unassigned"); acc[branch] = (acc[branch] || 0) + (getText(row, "escalation_level") !== "Level 0" ? 1 : 0); return acc; }, {});
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function buildFollowUpSeries(rows) {
  const counts = rows.reduce((acc, row) => { const status = getText(row, "follow_up_status", "Pending"); acc[status] = (acc[status] || 0) + 1; return acc; }, {});
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function renderBarChart(containerId, items, accent) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const maxValue = Math.max(...items.map((item) => safeNumber(item.value, 0)), 1);
  container.innerHTML = `<div class="bar-chart">${items.map((item) => { const barHeight = Math.max(6, Math.round((safeNumber(item.value, 0) / maxValue) * 100)); return `<div class="bar-column"><div class="bar-fill" style="height:${barHeight}%; background:${accent};"></div><div class="bar-label">${toDisplayValue(item.label, "N/A")}</div><strong>${toDisplayValue(item.value, 0)}</strong></div>`; }).join("")}</div>`;
}

function renderLineChart(containerId, labels, values, colors) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const width = 360;
  const height = 180;
  const padding = 24;
  const maxValue = Math.max(...values, 1);
  const points = values.map((value, index) => { const x = padding + (index * (width - padding * 2)) / Math.max(1, values.length - 1); const y = height - padding - (value / maxValue) * (height - padding * 2); return `${x},${y}`; });
  const linePath = `M ${points.join(" L ")}`;
  container.innerHTML = `<div class="line-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Line chart"><path d="${linePath}" fill="none" stroke="${colors[0]}" stroke-width="3" /></svg><div class="bar-label">${labels.join(" / ")}</div></div>`;
}

function renderDonutChart(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const total = items.reduce((sum, item) => sum + safeNumber(item.value, 0), 0);
  let offset = 0;
  const segments = items.map((item) => { const value = safeNumber(item.value, 0); const percentage = total ? (value / total) * 100 : 0; const circumference = 2 * Math.PI * 40; const dash = (percentage / 100) * circumference; const segment = `<circle cx="60" cy="60" r="40" fill="transparent" stroke="${item.label === "Closed" || item.label === "Repeat complaints" || item.label === "Other" ? "#2e8b57" : "#c8102e"}" stroke-width="16" stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="-${offset}" transform="rotate(-90 60 60)"></circle>`; offset += dash; return segment; });
  container.innerHTML = `<div class="donut-chart"><svg width="140" height="140" viewBox="0 0 120 120">${segments.join("")}<circle cx="60" cy="60" r="28" fill="#fff"></circle></svg><div class="bar-label">${items.map((item) => `${item.label}: ${item.value}`).join(" • ")}</div></div>`;
}

function renderVoiceOfCustomer(rows) {
  const topFeedback = rows.slice(0, 5).map((row) => ({ title: getText(row, "customer_name", "Customer"), detail: `${getText(row, "complaint_category", "General")} • ${getText(row, "complaint_description", "No details provided")}` }));
  document.getElementById("voiceOfCustomer").innerHTML = topFeedback.map((item) => `<div class="list-item"><strong>${item.title}</strong><div>${item.detail}</div></div>`).join("");
}

function renderActionTracker() {
  const actions = [
    { issue: "Service delay", branch: "Branch 2", rootCause: "Parts unavailability", correctiveAction: "Daily stock review", owner: "Naveen B", dueDate: "2025-10-12", status: "In progress", remarks: "Escalation risk monitored" },
    { issue: "Repeat care calls", branch: "Service Center 4", rootCause: "Handover gap", correctiveAction: "Supervisor review", owner: "Meera D", dueDate: "2025-10-08", status: "Pending", remarks: "Customer retention risk" },
    { issue: "SLA misses", branch: "Branch 3", rootCause: "High volume peaks", correctiveAction: "Add overflow coverage", owner: "Ravi Menon", dueDate: "2025-10-14", status: "Planned", remarks: "Improve first response" }
  ];
  document.getElementById("actionTracker").innerHTML = `<table><thead><tr><th>Issue</th><th>Branch / centre</th><th>Root cause</th><th>Corrective action</th><th>Owner</th><th>Due date</th><th>Status</th><th>Management remarks</th></tr></thead><tbody>${actions.map((action) => `<tr><td>${action.issue}</td><td>${action.branch}</td><td>${action.rootCause}</td><td>${action.correctiveAction}</td><td>${action.owner}</td><td>${action.dueDate}</td><td>${action.status}</td><td>${action.remarks}</td></tr>`).join("")}</tbody></table>`;
}

function renderManagementInsights(rows) {
  const branchCounts = rows.reduce((acc, row) => { const branch = getText(row, "branch", "Unknown Branch"); acc[branch] = (acc[branch] || 0) + 1; return acc; }, {});
  const topBranch = Object.entries(branchCounts).sort((a, b) => b[1] - a[1])[0] || ["No data", 0];
  const serviceScores = rows.reduce((acc, row) => { const serviceCentre = getText(row, "service_centre", "Not Assigned"); acc[serviceCentre] = acc[serviceCentre] || []; acc[serviceCentre].push(getNumber(row, "csat", 0)); return acc; }, {});
  const lowService = Object.entries(serviceScores).map(([name, scores]) => [name, average(scores)]).sort((a, b) => a[1] - b[1])[0] || ["No data", 0];
  const slaIssues = rows.filter((row) => getText(row, "sla_status") === "Non-compliant").length;
  const escalations = rows.filter((row) => getText(row, "escalation_level") !== "Level 0").length;
  const repeats = rows.filter((row) => getText(row, "repeat_complaint") === "Yes").length;
  const insights = [
    `The highest complaint volume is in ${topBranch[0]} with ${topBranch[1]} cases in the selected window.`,
    `The lowest CSAT is observed at ${lowService[0]} with an average of ${lowService[1].toFixed(1)}/5.`,
    `SLA non-compliance remains visible in ${slaIssues} cases and should be reviewed with branch supervisors.`,
    `Escalation activity is trending upward with ${escalations} cases requiring senior intervention.`,
    `Repeat complaints account for ${repeats} cases and signal a need for deeper root cause analysis.`,
    "Recommended management action: prioritize service recovery outreach, branch-level coaching, and a daily review of high-risk tickets."
  ];
  document.getElementById("managementInsights").innerHTML = insights.map((insight) => `<div class="insight-item">${insight}</div>`).join("");
}

function renderValidationReport() {
  const report = state.validationReport;
  const container = document.getElementById("validationReport");
  if (!container) return;
  if (!report) {
    container.innerHTML = '<div class="validation-report-item"><strong>No validation report yet.</strong><div>Upload a workbook or CSV to generate a quality audit.</div></div>';
    return;
  }
  const warningsMarkup = report.warnings.length ? report.warnings.map((warning) => `<div class="validation-report-item"><strong>Warning</strong><div>${warning}</div></div>`).join("") : '<div class="validation-report-item"><strong>Quality check</strong><div>No warnings detected.</div></div>';
  const invalidRowsMarkup = report.invalidRows.length ? report.invalidRows.map((item) => `<div class="validation-report-item"><strong>Row ${item.rowNumber}</strong><div>Missing values: ${item.missingFields.join(", ")}</div></div>`).join("") : '<div class="validation-report-item"><strong>Rows</strong><div>All rows contain the required fields.</div></div>';
  container.innerHTML = `<div class="validation-report-list">${warningsMarkup}${invalidRowsMarkup}<div class="validation-report-item"><strong>Source</strong><div>${report.sourceLabel}</div></div><div class="validation-report-item"><strong>Summary</strong><div>${report.totalRows} rows received, ${report.normalizedRows} normalized, ${report.ignoredRows} ignored as empty.</div></div></div>`;
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
  const tbody = rows.map((row) => {
    const statusClass = getText(row, "status") === "Closed" ? "closed" : getText(row, "status") === "Escalated" ? "high" : getText(row, "status") === "Pending Customer" ? "pending" : "open";
    const priorityClass = getText(row, "priority") === "Critical" || getText(row, "priority") === "High" ? "high" : "open";
    return `<tr><td>${getText(row, "case_id", "Not Available")}</td><td>${getText(row, "date", "Not Available")}</td><td>${getText(row, "customer_name", "Not Available")}</td><td>${getText(row, "mobile_number", "Not Available")}</td><td>${getText(row, "vehicle_registration_number", "Not Available")}</td><td>${getText(row, "vehicle_model", "Not Available")}</td><td>${getText(row, "branch", "Unknown Branch")}</td><td>${getText(row, "service_centre", "Not Assigned")}</td><td>${getText(row, "complaint_category", "Not Available")}</td><td>${getText(row, "complaint_description", "Not Available")}</td><td><span class="badge ${priorityClass}">${getText(row, "priority", "Not Available")}</span></td><td>${getText(row, "case_owner", "Not Available")}</td><td><span class="badge ${statusClass}">${getText(row, "status", "Not Available")}</span></td><td>${getText(row, "sla_status", "Not Available")}</td><td>${getNumber(row, "response_time", 0)}m</td><td>${getNumber(row, "resolution_time", 0)}h</td><td>${getNumber(row, "csat", 0).toFixed(1)}/5</td><td>${getText(row, "escalation_level", "Level 0")}</td><td>${getText(row, "follow_up_status", "Pending")}</td></tr>`;
  }).join("");
  document.getElementById("caseTable").innerHTML = `<table><thead><tr>${headers.map((header) => `<th data-key="${header.key}">${header.label}</th>`).join("")}</tr></thead><tbody>${tbody || '<tr><td colspan="19">No matching cases found.</td></tr>'}</tbody></table>`;
  document.querySelectorAll("th[data-key]").forEach((header) => {
    header.addEventListener("click", () => {
      const key = header.getAttribute("data-key");
      state.sort = { key, direction: state.sort.key === key && state.sort.direction === "asc" ? "desc" : "asc" };
      render();
    });
  });
  const tableSection = document.getElementById("caseTable").closest(".section-card");
  const existingSummary = tableSection?.querySelector(".table-toolbar-summary");
  if (existingSummary) existingSummary.remove();
  document.getElementById("caseTable").insertAdjacentHTML("beforebegin", `<div class="table-toolbar-summary"><span>${totalRows} records shown</span></div>`);
}

function renderPagination(totalRows, totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = `<button ${state.page === 1 ? "disabled" : ""} id="prevPage">Previous</button><span>Page ${state.page} of ${totalPages}</span><button ${state.page === totalPages ? "disabled" : ""} id="nextPage">Next</button>`;
  document.getElementById("prevPage")?.addEventListener("click", () => { if (state.page > 1) { state.page -= 1; render(); } });
  document.getElementById("nextPage")?.addEventListener("click", () => { if (state.page < totalPages) { state.page += 1; render(); } });
}

function populateFilters(rows) {
  const branchSelect = document.getElementById("branchFilter");
  const serviceSelect = document.getElementById("serviceFilter");
  const categorySelect = document.getElementById("categoryFilter");
  const statusSelect = document.getElementById("statusFilter");
  const customerTypeSelect = document.getElementById("customerTypeFilter");
  const branchOptions = [...new Set(rows.map((row) => getText(row, "branch", "Unknown Branch")).filter((value) => value && value !== "Not Available"))].sort();
  const serviceOptions = [...new Set(rows.map((row) => getText(row, "service_centre", "Not Assigned")).filter((value) => value && value !== "Not Available"))].sort();
  const categoryOptions = [...new Set(rows.map((row) => getText(row, "complaint_category", "Not Available")).filter((value) => value && value !== "Not Available"))].sort();
  const statusOptions = [...new Set(rows.map((row) => getText(row, "status", "Not Available")).filter((value) => value && value !== "Not Available"))].sort();
  const customerTypeOptions = [...new Set(rows.map((row) => getText(row, "customer_type", "Unknown")).filter((value) => value && value !== "Not Available"))].sort();
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
  document.getElementById("refreshDashboard").addEventListener("click", async () => { await loadSampleData(); });
  document.getElementById("downloadCsv").addEventListener("click", () => downloadCSV(state.filteredRows));
  document.getElementById("printDashboard").addEventListener("click", () => window.print());
  document.getElementById("csvUpload").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const uploadedRows = await parseUploadedFile(file);
      const prepared = prepareRows(uploadedRows, file.name);
      state.rows = prepared.rows;
      state.filteredRows = prepared.rows;
      state.sourceLabel = file.name;
      state.validationReport = prepared.validationReport;
      populateFilters(state.rows);
      render();
      document.getElementById("lastUpdated").textContent = new Date().toLocaleString();
    } catch (error) {
      console.error(error);
      alert(`Unable to read the selected file. Please use a CSV or Excel workbook with standard column headers. ${error.message}`);
    }
  });
}

async function loadSampleData() {
  try {
    const response = await fetch("sample-data.csv");
    if (!response.ok) throw new Error("Unable to fetch sample data");
    const prepared = prepareRows(normalizeRows(parseCSV(await response.text())), "sample-data.csv");
    if (prepared.rows.length) {
      state.rows = prepared.rows;
      state.filteredRows = prepared.rows;
      state.sourceLabel = "sample-data.csv";
      state.validationReport = prepared.validationReport;
      populateFilters(state.rows);
      render();
      document.getElementById("lastUpdated").textContent = new Date().toLocaleString();
      return;
    }
  } catch (error) {
    console.warn("Falling back to built-in sample data", error);
  }
  const sampleRows = buildSampleRows(120);
  const prepared = prepareRows(sampleRows, "Built-in sample data");
  state.rows = prepared.rows;
  state.filteredRows = prepared.rows;
  state.sourceLabel = "Built-in sample data";
  state.validationReport = prepared.validationReport;
  populateFilters(state.rows);
  render();
  document.getElementById("lastUpdated").textContent = new Date().toLocaleString();
}

function setDateDisplay() {
  const dateEl = document.getElementById("currentDate");
  const updatedEl = document.getElementById("lastUpdated");
  dateEl.textContent = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  updatedEl.textContent = new Date().toLocaleString("en-IN");
}

function init(){ setDateDisplay(); bindEvents(); loadSampleData(); }
document.addEventListener("DOMContentLoaded", init);
