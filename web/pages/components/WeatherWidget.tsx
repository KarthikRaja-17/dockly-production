// 'use client';

// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Sun, Cloud, CloudRain, Thermometer, Wind, Droplets } from 'lucide-react';

// interface WeatherData {
//   location: string;
//   temperature: number;
//   condition: string;
//   humidity: number;
//   windSpeed: number;
//   icon: string;
// }

// const WeatherWidget: React.FC = () => {
//   const [weather, setWeather] = useState<WeatherData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchWeather = async () => {
//       try {
//         // Get user's location
//         if (navigator.geolocation) {
//           navigator.geolocation.getCurrentPosition(async (position) => {
//             const { latitude, longitude } = position.coords;

//             // Using OpenWeatherMap API (free tier)
//             const API_KEY = 'demo'; // Replace with actual API key
//             const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

//             try {
//               const response = await fetch(url);
//               const data = await response.json();

//               setWeather({
//                 location: data.name || 'Your Location',
//                 temperature: Math.round(data.main?.temp || 22),
//                 condition: data.weather?.[0]?.description || 'Partly cloudy',
//                 humidity: data.main?.humidity || 65,
//                 windSpeed: Math.round(data.wind?.speed * 3.6) || 12,
//                 icon: data.weather?.[0]?.icon || '01d'
//               });
//             } catch (error) {
//               // Fallback data for demo
//               setWeather({
//                 location: 'Your Location',
//                 temperature: 22,
//                 condition: 'Partly cloudy',
//                 humidity: 65,
//                 windSpeed: 12,
//                 icon: '02d'
//               });
//             }
//             setLoading(false);
//           }, () => {
//             // Fallback if location denied
//             setWeather({
//               location: 'Demo Location',
//               temperature: 24,
//               condition: 'Sunny',
//               humidity: 58,
//               windSpeed: 8,
//               icon: '01d'
//             });
//             setLoading(false);
//           });
//         }
//       } catch (error) {
//         setLoading(false);
//       }
//     };

//     fetchWeather();
//   }, []);

//   const getWeatherIcon = (condition: string) => {
//     if (condition.includes('rain')) return <CloudRain size={120} color="#60a5fa" />;
//     if (condition.includes('cloud')) return <Cloud size={120} color="#94a3b8" />;
//     return <Sun size={120} color="#fbbf24" />;
//   };

//   if (loading) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         style={{
//           backgroundColor: "#f0faff", // light blue background
//           borderRadius: "20px",
//           padding: "24px",
//           color: "#003f5c", // deep blue text
//           boxShadow: "0 8px 24px rgba(0, 63, 92, 0.1)",
//           border: "1px solid #b3e5fc", // darker blue border
//           minHeight: "180px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
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
//       whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(116, 185, 255, 0.4)' }}
//       transition={{ duration: 0.3 }}
//       style={{
//         backgroundColor: "#e3f2fd", // very light blue
//         borderRadius: "20px",
//         padding: "24px",
//         color: "#0d47a1", // dark blue text for good contrast
//         boxShadow: "0 8px 24px rgba(13, 71, 161, 0.12)",
//         border: "1px solid #90caf9", // slightly darker border of the same tone
//         cursor: "pointer",
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
//           marginBottom: '16px',
//           fontSize: '14px',
//           fontWeight: '600',
//           textTransform: 'uppercase',
//           letterSpacing: '0.5px',
//           opacity: 0.9,
//         }}
//       >
//         <Thermometer size={18} />
//         <span>Weather • {weather?.location}</span>
//       </motion.div>

//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//         <div>
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
//             style={{ fontSize: '48px', fontWeight: '800', lineHeight: 1 }}
//           >
//             {weather?.temperature}°C
//           </motion.div>
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.6 }}
//             style={{ fontSize: '16px', opacity: 0.9, textTransform: 'capitalize' }}
//           >
//             {weather?.condition}
//           </motion.div>
//         </div>

//         <motion.div
//           initial={{ opacity: 0, rotate: -90 }}
//           animate={{ opacity: 1, rotate: 0 }}
//           transition={{ delay: 0.8 }}
//         >
//           {getWeatherIcon(weather?.condition || '')}
//         </motion.div>
//       </div>

//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 1 }}
//         style={{
//           display: 'flex',
//           gap: '20px',
//           marginTop: '16px',
//           fontSize: '14px',
//         }}
//       >
//         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//           <Droplets size={16} />
//           <span>{weather?.humidity}%</span>
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//           <Wind size={16} />
//           <span>{weather?.windSpeed} km/h</span>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default WeatherWidget;

'use client'

import React from 'react';
import { Sun } from 'lucide-react';

const Weather: React.FC = () => {
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
        <Sun size={20} />
        <span>Weather • Omaha</span>
      </div>
      <div
        style={{
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '4px',
          color: '#1a202c',
        }}
      >
        72°F
      </div>
      <div style={{ fontSize: '14px', color: '#64748b' }}>
        Partly cloudy
      </div>
    </div>
  );
};

export default Weather;