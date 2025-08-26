# MDIPL Analytics Dashboard - Project Architecture

## Overview
This is a React-based analytics dashboard application built with Vite, Chart.js, and Plotly. The dashboard provides comprehensive data visualization for business metrics including sales, projects, vendors, and geographic distribution.

## Project Structure
```
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   ├── MDIPL Logo.png
│   │   └── react.svg
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── GeoMap.jsx
│   │   ├── GraphSection.jsx
│   │   ├── Header.jsx
│   │   └── KPICards.jsx
│   ├── config/
│   │   └── api.js
│   ├── graphs/
│   │   ├── CustomersByTotalRevenue.jsx
│   │   ├── DayOfWeekSalesChart.jsx
│   │   ├── DealSizeDistribution.jsx
│   │   ├── Demo.jsx
│   │   ├── Demo2.jsx
│   │   ├── Demo3.jsx
│   │   ├── LoyalLegion.jsx
│   │   ├── ProjectEfficiency.jsx
│   │   ├── ProjectsByTotalRevenue.jsx
│   │   ├── ProjectsCompletedByMonths.jsx
│   │   ├── SpendBySeasonChart.jsx
│   │   ├── SupplierDiversityForTopCustomers.jsx
│   │   ├── SuppliersByTotalSpend.jsx
│   │   ├── SupplyChainConcentrationRisk.jsx
│   │   ├── TheCustomerValueMatrix.jsx
│   │   ├── TheProjectPortfolio.jsx
│   │   ├── TopVendorsChart.jsx
│   │   ├── TotalSalesPerMonth.jsx
│   │   ├── TypicalDealSize.jsx
│   │   ├── WhoFundsOurTopProjects.jsx
│   │   └── YearlySpent.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

## Core Components

### 1. App.jsx
The main entry point component that renders the Dashboard component.

### 2. Dashboard.jsx
The primary layout component that divides the screen into two sections:
- Fixed left sidebar (25% width) for KPI cards
- Scrollable right section (75% width) for graph visualizations

### 3. KPICards.jsx
Displays key performance indicators in an attractive card-based layout:
- Total Bills
- Unique Vendors
- Unique Projects
- Monthly Avg Spend
- Top Vendor Contribution
- Interactive GeoMap visualization

Features:
- Loading states with spinners
- Error handling with retry functionality
- Empty state handling
- Responsive design with gradients and icons

### 4. GraphSection.jsx
Container for all data visualization components:
- Grid layout with responsive columns (1 column on mobile, 2 on desktop)
- 17 different graph components
- Reusable GraphCard wrapper for consistent styling

### 5. GeoMap.jsx
Interactive map visualization using Plotly:
- Displays customers, suppliers, and projects across India
- Color-coded markers for different entity types
- Geographic coordinates for major Indian cities
- Choropleth map of Indian states

## Graph Components
The dashboard includes various chart types:
- Line charts (TotalSalesPerMonth.jsx)
- Bar charts (TopVendorsChart.jsx)
- Area charts (ProjectsCompletedByMonths.jsx)
- Scatter plots (GeoMap.jsx)
- Box plots and violin plots
- Pie charts and doughnut charts

## Data Management

### API Configuration (src/config/api.js)
Centralized API management with:
- Environment-based URL configuration (development vs production)
- Comprehensive endpoint mapping
- CORS handling with fallback strategies
- Request helper functions with error handling

### Data Fetching Patterns
Two approaches for data visualization:
1. Hardcoded data (e.g., TotalSalesPerMonth.jsx)
2. API-fetched data with loading/error states (e.g., ProjectsCompletedByMonths.jsx)

## Styling

### Tailwind CSS
The project uses Tailwind CSS for styling with:
- Custom configuration in tailwind.config.js
- Montserrat font family
- Responsive design patterns
- Gradient-based color schemes
- Consistent spacing and typography

### CSS Structure
- Global styles in src/index.css
- Component-specific styles in src/App.css
- Utility classes for rapid UI development

## Build Configuration

### Vite Configuration
- React plugin for JSX transformation
- Proxy configuration for API requests
- Development server with hot module replacement

### Proxy Settings
API requests are proxied to https://mdiplreport.iitea.xyz in development to avoid CORS issues.

## Key Features

1. **Responsive Design**: Adapts to different screen sizes
2. **Interactive Visualizations**: Charts with hover details and tooltips
3. **Data Loading States**: Handling for loading, error, and empty states
4. **Geographic Visualization**: Interactive map of India with business locations
5. **Comprehensive Metrics**: 17+ different data visualizations
6. **Error Resilience**: Multiple fallback strategies for API requests
7. **Performance Optimized**: React.memo, useCallback, and useMemo for efficient rendering

## Development Workflow

1. Clone the repository
2. Install dependencies with `npm install`
3. Run development server with `npm run dev`
4. Build for production with `npm run build`

## Dependencies

### Production Dependencies
- React and React DOM
- Chart.js and react-chartjs-2 for charting
- Plotly.js and react-plotly.js for advanced visualizations
- Tailwind CSS for styling
- React Icons for UI icons

### Development Dependencies
- Vite for build tooling
- ESLint for code quality
- PostCSS and Autoprefixer for CSS processing