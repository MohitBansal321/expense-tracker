import { scaleBand } from "@devexpress/dx-chart-core";
import { Animation, ArgumentScale, EventTracker } from "@devexpress/dx-react-chart";
import {
  ArgumentAxis,
  BarSeries,
  Chart,
  Tooltip,
  ValueAxis,
} from "@devexpress/dx-react-chart-material-ui";

import Paper from "@mui/material/Paper";
import dayjs from "dayjs";
import * as React from "react";

// TransactionChart component that renders a bar chart
export default function TransactionChart({ data }) {
  // Map transaction data to include a 'month' property based on '_id'
  const chartData = data.map((item) => {
    return {
      monthYear: `${dayjs().month(item._id.month - 1).format("MMMM")} ${item._id.year}`,
      totalExpenses: item.totalExpenses,
    };
  });
  

  return (
    // Render a Material-UI Paper component to provide a background
    <Paper sx={{ marginTop: 5 }}>
      {/* Render the chart */}
      <Chart data={chartData}>
        {/* Configure the argument scale */}
        <ArgumentScale factory={scaleBand} />
        
        {/* Render the argument axis (X-axis) */}
        <ArgumentAxis />
        
        {/* Render the value axis (Y-axis) */}
        <ValueAxis />
        
        {/* Render the bar series for expenses */}
        <BarSeries valueField="totalExpenses" argumentField="monthYear" />
        
        {/* Add animation to the chart */}
        <Animation />
        
        {/* Enable event tracking (e.g., hover interactions) */}
        <EventTracker />
        
        {/* Render tooltips for data points */}
        <Tooltip />
      </Chart>
    </Paper>
  );
}
