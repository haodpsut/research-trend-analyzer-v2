
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { AnalyzedKeyword } from '../types';

interface BarChartComponentProps {
    data: AnalyzedKeyword[];
}

const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white border border-gray-300 rounded shadow-lg">
          <p className="font-bold text-gray-800">{`${label}`}</p>
          <p className="text-sm text-indigo-600">{`Prominence: ${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

const BarChartComponent: React.FC<BarChartComponentProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{
                    top: 5,
                    right: 20,
                    left: 20,
                    bottom: 5,
                }}
                layout="vertical"
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" domain={[0, 1]} hide />
                <YAxis dataKey="keyword" type="category" width={120} tick={{ fill: '#4b5563', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(238, 242, 255, 0.5)'}} />
                <Bar dataKey="score" fill="#8884d8" barSize={20}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default BarChartComponent;
