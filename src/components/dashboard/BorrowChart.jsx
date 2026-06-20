import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement
  } from 'chart.js';
  import { Bar, Doughnut } from 'react-chartjs-2';
  
  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
  
  export function BorrowBarChart({ data }) {
    const chartData = {
      labels: data.map(d => d.title.substring(0, 20) + (d.title.length > 20 ? '...' : '')),
      datasets: [{
        label: 'Total Borrows',
        data: data.map(d => d.totalBorrows),
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1,
      }],
    };
  
    return (
      <Bar data={chartData} options={{
        responsive: true,
        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Most Borrowed Books' } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }} />
    );
  }
  
  export function StatusDoughnut({ borrowed, returned, overdue }) {
    const data = {
      labels: ['Active Borrows', 'Overdue', 'Returned Today'],
      datasets: [{
        data: [borrowed - overdue, overdue, returned],
        backgroundColor: ['#3498db', '#e74c3c', '#27ae60'],
      }],
    };
  
    return (
      <Doughnut data={data} options={{
        responsive: true,
        plugins: { legend: { position: 'right' }, title: { display: true, text: 'Borrow Status Distribution' } }
      }} />
    );
  }