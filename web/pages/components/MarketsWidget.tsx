// 'use client';
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

// interface StockData {
//   symbol: string;
//   price: number;
//   change: number;
//   changePercent: number;
// }

// const MarketsWidget: React.FC = () => {
//   const [stocks, setStocks] = useState<StockData[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStocks = async () => {
//       try {
//         // Using Alpha Vantage API (free tier) - replace with actual API key
//         const API_KEY = 'demo';
//         const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN'];

//         try {
//           // In production, you'd make actual API calls
//           // const promises = symbols.map(symbol => 
//           //   fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`)
//           // );

//           // Fallback demo data
//           setStocks([
//             { symbol: 'AAPL', price: 175.43, change: 4.12, changePercent: 2.41 },
//             { symbol: 'GOOGL', price: 2847.63, change: 48.21, changePercent: 1.72 },
//             { symbol: 'MSFT', price: 378.85, change: -2.15, changePercent: -0.56 },
//             { symbol: 'AMZN', price: 3342.88, change: 89.44, changePercent: 2.75 },
//           ]);
//         } catch (error) {
//           // Fallback data
//           setStocks([
//             { symbol: 'AAPL', price: 175.43, change: 4.12, changePercent: 2.41 },
//             { symbol: 'GOOGL', price: 2847.63, change: 48.21, changePercent: 1.72 },
//             { symbol: 'MSFT', price: 378.85, change: -2.15, changePercent: -0.56 },
//             { symbol: 'AMZN', price: 3342.88, change: 89.44, changePercent: 2.75 },
//           ]);
//         }
//         setLoading(false);
//       } catch (error) {
//         setLoading(false);
//       }
//     };

//     fetchStocks();

//     // Update every 30 seconds
//     const interval = setInterval(fetchStocks, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   if (loading) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         style={{
//           backgroundColor: '#e0f7f4',
//           borderRadius: '20px',
//           padding: '24px',
//           color: '#00796b',
//           boxShadow: '0 8px 24px rgba(130, 233, 222, 0.3)',
//           border: '1px solid #82e9de',
//           minHeight: '180px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//           style={{
//             width: '40px',
//             height: '40px',
//             border: '3px solid rgba(255, 255, 255, 0.3)',
//             borderTop: '3px solid white',
//             borderRadius: '50%',
//           }}
//         />
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0, 184, 148, 0.4)' }}
//       transition={{ duration: 0.3 }}
//       style={{
//         backgroundColor: '#e0f7f4',
//         borderRadius: '20px',
//         padding: '24px',
//         color: '#00796b',
//         boxShadow: '0 8px 24px rgba(130, 233, 222, 0.3)',
//         border: '1px solid #82e9de',
//         cursor: 'pointer',
//       }}
//     >
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.2 }}
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: '12px',
//           marginBottom: '20px',
//           fontSize: '14px',
//           fontWeight: '600',
//           textTransform: 'uppercase',
//           letterSpacing: '0.5px',
//           opacity: 0.9,
//         }}
//       >
//         <BarChart3 size={18} />
//         <span>Markets</span>
//       </motion.div>

//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: '1fr 1fr',
//         gap: '16px',
//       }}>
//         {stocks.map((stock, index) => (
//           <motion.div
//             key={stock.symbol}
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.3 + index * 0.1 }}
//             whileHover={{ scale: 1.1, rotate: 2 }}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               padding: '12px 16px',
//               background: '#ffffff',
//               borderRadius: '12px',
//               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
//               border: '1px solid #e0f2f1',
//             }}
//           >
//             <div>
//               <div style={{ fontWeight: '700', fontSize: '14px' }}>
//                 {stock.symbol}
//               </div>
//               <div style={{ fontSize: '12px', opacity: 0.8 }}>
//                 ${stock.price.toFixed(2)}
//               </div>
//             </div>
//             <div style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '4px',
//               color: stock.changePercent >= 0 ? '#2e7d32' : '#c62828',
//             }}>
//               {stock.changePercent >= 0 ?
//                 <TrendingUp size={14} /> :
//                 <TrendingDown size={14} />
//               }
//               <span style={{ fontSize: '12px', fontWeight: '600' }}>
//                 {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
//               </span>
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.8 }}
//         style={{
//           marginTop: '16px',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '6px',
//           fontSize: '12px',
//           opacity: 0.8,
//         }}
//       >
//         <DollarSign size={12} />
//         <span>Live market data</span>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default MarketsWidget;
'use client'

import React from 'react';
import { Activity } from 'lucide-react';

const Markets: React.FC = () => {
  const stocks = [
    { symbol: 'AAPL', change: '+2.3%', positive: true },
    { symbol: 'GOOGL', change: '+1.8%', positive: true },
    { symbol: 'MSFT', change: '-0.5%', positive: false },
    { symbol: 'AMZN', change: '+3.1%', positive: true },
  ];

  return (
    <div
      style={{
        background: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = '#2563eb';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          fontSize: '12px',
          textTransform: 'uppercase',
          color: '#64748b',
          fontWeight: 600,
        }}
      >
        <Activity size={20} />
        <span>Markets</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
        }}
      >
        {stocks.map((stock, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {stock.symbol}
            </span>
            <span
              style={{
                fontSize: '14px',
                color: stock.positive ? '#10b981' : '#ef4444',
                fontWeight: 500,
              }}
            >
              {stock.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Markets;