"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./home-board.module.css";

type PaymentStatusChartProps = {
  verifiedPayments: number;
  totalPayments: number;
  slots?: number;
};

export function PaymentStatusChart({
  verifiedPayments,
  totalPayments,
  slots = 6,
}: PaymentStatusChartProps) {
  const totalSafe = Math.max(totalPayments, 1);
  const slotCount = Math.max(slots, 1);
  const verifiedSlots = Math.min(
    slotCount,
    Math.round((verifiedPayments / totalSafe) * slotCount),
  );

  const chartData = Array.from({ length: slotCount }, (_, index) => ({
    id: `slot-${index + 1}`,
    value: 1,
    verified: index < verifiedSlots,
  }));

  return (
    <div
      className={styles.progressChart}
      role="img"
      aria-label={`${verifiedPayments} de ${totalPayments} pagos verificados`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          barCategoryGap={8}
        >
          <XAxis dataKey="id" hide />
          <YAxis hide domain={[0, 1]} />
          <Bar
            dataKey="value"
            radius={[2, 2, 2, 2]}
            barSize={24}
            isAnimationActive={false}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.id}
                fill={entry.verified ? "#f2ece7" : "rgba(242, 236, 231, 0.35)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
