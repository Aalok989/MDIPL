import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://mdiplreport.iitea.xyz' || "http://192.168.0.114:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'chartjs-plugin-datalabels'],
          'plotly-vendor': ['plotly.js', 'react-plotly.js'],
          'ui-vendor': ['react-icons', 'framer-motion'],
          'leaflet-vendor': ['leaflet', 'react-leaflet', 'leaflet.markercluster'],
          // Group graph components by chart library
          'chartjs-graphs': [
            './src/graphs/DayOfWeekSalesChart.jsx',
            './src/graphs/CustomersByTotalRevenue.jsx',
            './src/graphs/SuppliersByTotalSpend.jsx',
            './src/graphs/ProjectsByTotalRevenue.jsx',
            './src/graphs/SupplierDiversityForTopCustomers.jsx',
            './src/graphs/LoyalLegion.jsx',
            './src/graphs/SpendBySeasonChart.jsx',
            './src/graphs/TotalSalesPerMonth.jsx',
            './src/graphs/ProjectsCompletedByMonths.jsx',
            './src/graphs/TypicalDealSize.jsx',
            './src/graphs/TheCustomerValueMatrix.jsx',
            './src/graphs/RevenueForecast.jsx'
          ],
          'plotly-graphs': [
            './src/graphs/CustomerByHealthScore.jsx',
            './src/graphs/ProjectEfficiency.jsx',
            './src/graphs/WhoFundsOurTopProjects.jsx',
            './src/graphs/SuccessBlueprintSuppliers.jsx',
            './src/graphs/SuccessBlueprintCustomers.jsx',
            './src/graphs/TheProjectPortfolio.jsx'
          ]
        }
      }
    },
    // Increase chunk size warning limit since we're intentionally creating larger chunks
    chunkSizeWarningLimit: 1000
  }
})
