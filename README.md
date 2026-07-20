# Harsha Toyota Customer Care Dashboard

This project is a responsive, static dashboard for customer care operations across Toyota sales branches and service centres. It is designed for senior management and customer care teams and works as a GitHub Pages-ready website.

## How to open the dashboard locally

1. Open the project folder in your browser directly.
2. Double-click the index.html file, or open it from a browser such as Chrome or Edge.
3. The dashboard will load without a local server because it uses plain HTML, CSS, and JavaScript.

## How to update sample-data.csv

1. Edit the sample-data.csv file in the project folder.
2. Keep the column names consistent with the required structure below.
3. Refresh the dashboard in the browser to view the updated data.

## How to upload a CSV inside the dashboard

1. Click the Upload CSV button in the header controls.
2. Select a CSV file from your computer.
3. The dashboard will update KPI cards, charts, tables, and management insights automatically.

## How to publish using GitHub Pages

1. Commit the files to your GitHub repository.
2. Open the repository settings.
3. Go to Pages and select the main branch as the source.
4. GitHub Pages will publish the dashboard at a web address for your repository.

## How to commit and push future changes

```bash
git add .
git commit -m "Update dashboard"
git push origin main
```

## Required CSV column names

The dashboard expects these columns in the uploaded or updated CSV file:

- case_id
- date
- customer_name
- mobile_number
- vehicle_registration_number
- vehicle_model
- branch
- service_centre
- complaint_category
- complaint_description
- priority
- case_owner
- status
- sla_status
- response_time
- resolution_time
- csat
- escalation_level
- follow_up_status
- customer_type
- repeat_complaint

## Notes

- The dashboard uses a built-in sample dataset if the CSV cannot be loaded directly from disk.
- The filters, KPI cards, charts, and management insights are all driven by the current dataset.
