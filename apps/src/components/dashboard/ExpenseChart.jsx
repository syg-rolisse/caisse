import { memo } from 'react'; // 👈 1. Importer `memo`
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

// Un composant personnalisé pour le Tooltip pour un meilleur design
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="tw-bg-white/80 tw-backdrop-blur-sm tw-p-3 tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-200">
        <p className="tw-font-semibold tw-text-gray-700">{label}</p>
        <p className="tw-text-green-600">
          {/* S'assure que totalDepense est un nombre avant de l'afficher */}
          Total : {(payload[0].value || 0).toLocaleString()} F
        </p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};

const ExpenseChart = ({ data }) => {
  // Log pour voir quand le graphique se redessine (utile pour le débuggage)
  console.log("Rendu du graphique ExpenseChart...");

  return (
    <div className="tw-bg-white/50 tw-backdrop-blur-sm tw-p-4 sm:tw-p-6 tw-rounded-2xl tw-shadow-lg tw-border tw-border-gray-100">
      <div className="tw-flex tw-items-center tw-mb-4">
        <div className="tw-p-2 tw-bg-orange-100 tw-rounded-lg tw-mr-3">
          <TrendingUp className="tw-w-6 tw-h-6 tw-text-orange-500" />
        </div>
        <div>
          <h3 className="tw-text-lg tw-font-semibold tw-text-gray-800">
            Répartition des Dépenses
          </h3>
          <p className="tw-text-sm tw-text-gray-500">
            Visualisation des totaux par catégorie
          </p>
        </div>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
            <XAxis 
              dataKey="wording" 
              tick={{ fill: '#6b7280', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`}
              tick={{ fill: '#6b7280', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="totalDepense"
              stroke="#fb923c" // Couleur Orange
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 8, fill: '#fb923c', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area type="monotone" dataKey="totalDepense" stroke={false} fillOpacity={1} fill="url(#colorUv)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

ExpenseChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    wording: PropTypes.string,
    // S'assurer que totalDepense est bien un nombre, même s'il est nul/undefined
    totalDepense: PropTypes.number,
  })).isRequired,
};

// 👇 2. Exporter la version mémoïsée du composant
export default memo(ExpenseChart);