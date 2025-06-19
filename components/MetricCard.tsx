interface MetricCardProps {
  value: number
  label: string
  prefix?: string
}

export default function MetricCard({ value, label, prefix = "" }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-value">
        {prefix}
        {value.toFixed(2)}
      </div>
      <div className="metric-label">{label}</div>
    </div>
  )
}
