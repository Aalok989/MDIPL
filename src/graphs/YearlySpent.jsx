import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
} from 'chart.js';
import boxplot from '@sgratzl/chartjs-chart-boxplot';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  boxplot
);

const data = {
  "labels": [
    "2000-12",
    "2005-04",
    "2022-01",
    "2022-05",
    "2022-06",
    "2022-07",
    "2022-08",
    "2022-09",
    "2022-10",
    "2022-11",
    "2022-12",
    "2023-01",
    "2023-02",
    "2023-03",
    "2023-04",
    "2023-05",
    "2023-06",
    "2023-07",
    "2023-08",
    "2023-09",
    "2023-10",
    "2023-11",
    "2023-12",
    "2024-01",
    "2024-02",
    "2024-03",
    "2024-04",
    "2024-05",
    "2024-06",
    "2024-07",
    "2024-08",
    "2024-09",
    "2024-10",
    "2024-11",
    "2024-12",
    "2025-01",
    "2025-02",
    "2025-03",
    "2025-04",
    "2025-05",
    "2025-06",
    "2025-07",
    "2025-08"
  ],
  "datasets": [
    {
      "label": "Boxplot Stats",
      "data": [
        {
          "label": "2000-12",
          "min": 4099.26,
          "q1": 4099.26,
          "median": 4099.26,
          "q3": 4099.26,
          "max": 4099.26,
          "num_bills": 1
        },
        {
          "label": "2005-04",
          "min": 1494971.8,
          "q1": 1494971.8,
          "median": 1494971.8,
          "q3": 1494971.8,
          "max": 1494971.8,
          "num_bills": 1
        },
        {
          "label": "2022-01",
          "min": 23564.9,
          "q1": 24090,
          "median": 61342.6,
          "q3": 119121.3,
          "max": 417957.48,
          "num_bills": 5
        },
        {
          "label": "2022-05",
          "min": 788,
          "q1": 19842,
          "median": 116589.86,
          "q3": 257713.56,
          "max": 1066587.85,
          "num_bills": 30
        },
        {
          "label": "2022-06",
          "min": 171.18,
          "q1": 6035.53,
          "median": 64233.6,
          "q3": 222849.67,
          "max": 1481227.75,
          "num_bills": 69
        },
        {
          "label": "2022-07",
          "min": 348.4,
          "q1": 11101.15,
          "median": 49771.22,
          "q3": 262995.74,
          "max": 2933480,
          "num_bills": 116
        },
        {
          "label": "2022-08",
          "min": 143,
          "q1": 17688.5,
          "median": 66835.5,
          "q3": 301804.51,
          "max": 1836426.63,
          "num_bills": 92
        },
        {
          "label": "2022-09",
          "min": 416.25,
          "q1": 23932.08,
          "median": 97488.09,
          "q3": 223527.55,
          "max": 3265700.07,
          "num_bills": 151
        },
        {
          "label": "2022-10",
          "min": 2717.98,
          "q1": 26951.5,
          "median": 109168,
          "q3": 332483,
          "max": 2127249.82,
          "num_bills": 109
        },
        {
          "label": "2022-11",
          "min": 510.77,
          "q1": 16243,
          "median": 79944.12,
          "q3": 221430.84,
          "max": 3568621.73,
          "num_bills": 175
        },
        {
          "label": "2022-12",
          "min": 1339.6,
          "q1": 19753.5,
          "median": 61555,
          "q3": 155651.39,
          "max": 1065557.41,
          "num_bills": 160
        },
        {
          "label": "2023-01",
          "min": 999.76,
          "q1": 14478.3,
          "median": 57248,
          "q3": 196586,
          "max": 1784371.3,
          "num_bills": 169
        },
        {
          "label": "2023-02",
          "min": 1313.64,
          "q1": 26074.04,
          "median": 66216,
          "q3": 292320.89,
          "max": 3956463.46,
          "num_bills": 130
        },
        {
          "label": "2023-03",
          "min": 584.4,
          "q1": 18246.17,
          "median": 47655.24,
          "q3": 151518.2,
          "max": 1551806.4,
          "num_bills": 105
        },
        {
          "label": "2023-04",
          "min": 1002,
          "q1": 10944.28,
          "median": 69187.24,
          "q3": 459816.92,
          "max": 564604620.96,
          "num_bills": 96
        },
        {
          "label": "2023-05",
          "min": 212.7,
          "q1": 20634.96,
          "median": 82372.56,
          "q3": 330462,
          "max": 2427507.6,
          "num_bills": 109
        },
        {
          "label": "2023-06",
          "min": 1198,
          "q1": 17861.5,
          "median": 54470.28,
          "q3": 166691.82,
          "max": 1966878.48,
          "num_bills": 118
        },
        {
          "label": "2023-07",
          "min": 267.2,
          "q1": 13979.6,
          "median": 46079.3,
          "q3": 105633.9,
          "max": 1922479.49,
          "num_bills": 121
        },
        {
          "label": "2023-08",
          "min": 193.23,
          "q1": 18148.99,
          "median": 43157.72,
          "q3": 155576.18,
          "max": 1739450.1,
          "num_bills": 166
        },
        {
          "label": "2023-09",
          "min": 258,
          "q1": 11958.42,
          "median": 39209.92,
          "q3": 114279.27,
          "max": 2635273.8,
          "num_bills": 112
        },
        {
          "label": "2023-10",
          "min": 416.49,
          "q1": 13762.95,
          "median": 45909.04,
          "q3": 176351.5,
          "max": 3584012.17,
          "num_bills": 152
        },
        {
          "label": "2023-11",
          "min": 490,
          "q1": 24227.61,
          "median": 60458.35,
          "q3": 195622.5,
          "max": 2612639.21,
          "num_bills": 112
        },
        {
          "label": "2023-12",
          "min": 726,
          "q1": 21195.79,
          "median": 54108,
          "q3": 153049.7,
          "max": 4198151.84,
          "num_bills": 176
        },
        {
          "label": "2024-01",
          "min": 246.92,
          "q1": 12215.25,
          "median": 48753.83,
          "q3": 112345.25,
          "max": 3865243.19,
          "num_bills": 204
        },
        {
          "label": "2024-02",
          "min": 254,
          "q1": 7494.48,
          "median": 29370.5,
          "q3": 80006,
          "max": 1834493.2,
          "num_bills": 153
        },
        {
          "label": "2024-03",
          "min": 372,
          "q1": 10348.56,
          "median": 35950.6,
          "q3": 80918.29,
          "max": 2186388.6,
          "num_bills": 132
        },
        {
          "label": "2024-04",
          "min": 768.13,
          "q1": 16212.13,
          "median": 65397.29,
          "q3": 281707.6,
          "max": 4940210.72,
          "num_bills": 181
        },
        {
          "label": "2024-05",
          "min": 178.01,
          "q1": 18072,
          "median": 52882,
          "q3": 168146.76,
          "max": 1299847,
          "num_bills": 277
        },
        {
          "label": "2024-06",
          "min": 338,
          "q1": 7978.27,
          "median": 26514.42,
          "q3": 64711.75,
          "max": 743428,
          "num_bills": 172
        },
        {
          "label": "2024-07",
          "min": 136,
          "q1": 20943.5,
          "median": 84657.99,
          "q3": 474059.4,
          "max": 4046426.8,
          "num_bills": 189
        },
        {
          "label": "2024-08",
          "min": 206.8,
          "q1": 9427,
          "median": 49134.32,
          "q3": 140678.72,
          "max": 2423148,
          "num_bills": 189
        },
        {
          "label": "2024-09",
          "min": 254,
          "q1": 14018,
          "median": 59416.48,
          "q3": 136142.03,
          "max": 3118394.87,
          "num_bills": 205
        },
        {
          "label": "2024-10",
          "min": 474.66,
          "q1": 20457.96,
          "median": 59568.23,
          "q3": 209315.88,
          "max": 2624565.8,
          "num_bills": 269
        },
        {
          "label": "2024-11",
          "min": 159.6,
          "q1": 11492,
          "median": 33034.25,
          "q3": 89226,
          "max": 1395510.76,
          "num_bills": 297
        },
        {
          "label": "2024-12",
          "min": 202.08,
          "q1": 5680.2,
          "median": 18347.09,
          "q3": 52266.86,
          "max": 1106392.95,
          "num_bills": 270
        },
        {
          "label": "2025-01",
          "min": 105.02,
          "q1": 5330.34,
          "median": 16898.17,
          "q3": 43659.69,
          "max": 1197233.6,
          "num_bills": 246
        },
        {
          "label": "2025-02",
          "min": 23.6,
          "q1": 3796.85,
          "median": 14041.8,
          "q3": 40205.58,
          "max": 1263490,
          "num_bills": 146
        },
        {
          "label": "2025-03",
          "min": 117.53,
          "q1": 5214.7,
          "median": 17486,
          "q3": 45801.57,
          "max": 562901.3,
          "num_bills": 151
        },
        {
          "label": "2025-04",
          "min": 136.88,
          "q1": 4515.82,
          "median": 19775.54,
          "q3": 75700.8,
          "max": 1659712.48,
          "num_bills": 177
        },
        {
          "label": "2025-05",
          "min": 236,
          "q1": 8979.24,
          "median": 59317.4,
          "q3": 180499.5,
          "max": 2935184.89,
          "num_bills": 272
        },
        {
          "label": "2025-06",
          "min": 249.69,
          "q1": 12316.65,
          "median": 27140,
          "q3": 72521.06,
          "max": 2041305.6,
          "num_bills": 283
        },
        {
          "label": "2025-07",
          "min": 120.03,
          "q1": 12359.88,
          "median": 36726,
          "q3": 167099.92,
          "max": 1138594.98,
          "num_bills": 251
        },
        {
          "label": "2025-08",
          "min": 881.34,
          "q1": 20954,
          "median": 53218,
          "q3": 109597.24,
          "max": 1061056,
          "num_bills": 39
        }
      ]
    }
  ]
};

const chartData = {
  labels: data.labels,
  datasets: [
    {
      ...data.datasets[0],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      outlierColor: '#FFA500',
      padding: 10,
      itemRadius: 0,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Monthly Bill Amount Distribution (2000-2025)',
      font: {
        size: 18,
        weight: 'bold',
      },
      color: '#333',
    },
  },
  scales: {
    y: {
      type: 'logarithmic',
      title: {
        display: true,
        text: 'Bill Amount',
      },
    },
    x: {
      title: {
        display: true,
        text: 'Month-Year',
      },
      ticks: {
        maxRotation: 90,
        minRotation: 90,
      },
    },
  },
};

const YearlySpent = () => {
  return (
    <div className="w-full h-full">
      <div className="w-full h-full">
        <div className="h-full">
          <Chart type="boxplot" data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default YearlySpent;