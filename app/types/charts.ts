/** A chart series as the chart components take it. */
export interface ChartSeries {
  label: string
  color: string
  /** Formats this series' values in the tooltip and on its axis. */
  format?: (value: number) => string
}
