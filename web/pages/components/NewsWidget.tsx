// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Newspaper, ExternalLink, Clock, ArrowRight } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// interface NewsItem {
//   title: string;
//   source: string;
//   publishedAt: string;
//   url: string;
// }

// const NewsWidget: React.FC = () => {
//   const [news, setNews] = useState<NewsItem[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchNews = async () => {
//       try {
//         const API_KEY = '2cf0d82fb474466ba1e3a383c6b7b5f2';
//         const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${API_KEY}`;

//         try {
//           const response = await fetch(url);
//           const data = await response.json();
//           if (data.articles) {
//             setNews(data.articles.slice(0, 5).map((article: any) => ({
//               title: article.title,
//               source: article.source.name,
//               publishedAt: article.publishedAt,
//               url: article.url
//             })));
//           }
//         } catch {
//           setNews([
//             {
//               title: "Tech stocks rally continues as AI investments surge",
//               source: "Financial Times",
//               publishedAt: new Date().toISOString(),
//               url: "#"
//             },
//             {
//               title: "Federal Reserve signals potential rate stability ahead",
//               source: "Reuters",
//               publishedAt: new Date(Date.now() - 3600000).toISOString(),
//               url: "#"
//             },
//             {
//               title: "Climate summit reaches breakthrough agreement",
//               source: "BBC News",
//               publishedAt: new Date(Date.now() - 7200000).toISOString(),
//               url: "#"
//             }
//           ]);
//         }
//         setLoading(false);
//       } catch {
//         setLoading(false);
//       }
//     };

//     fetchNews();
//   }, []);

//   const formatTime = (dateString: string) => {
//     const diff = Date.now() - new Date(dateString).getTime();
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     if (hours < 1) return 'Just now';
//     if (hours < 24) return `${hours}h ago`;
//     return `${Math.floor(hours / 24)}d ago`;
//   };

//   const nextNews = () => {
//     setCurrentIndex((prev) => (prev + 1) % news.length);
//   };

//   const baseStyle = {
//     backgroundColor: "#fff7f0",
//     borderRadius: "20px",
//     padding: "24px",
//     color: "#5c3c21",
//     border: "1px solid #fcd9b6",
//     boxShadow: "0 8px 28px rgba(240, 173, 117, 0.3)",
//     minHeight: "180px"
//   };

//   if (loading) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         style={{
//           ...baseStyle,
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
//             borderTop: '3px solid #fb923c',
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
//       whileHover={{
//         y: -5,
//         boxShadow: '0 12px 40px rgba(251, 146, 60, 0.4)',
//       }}
//       transition={{ duration: 0.3 }}
//       style={{ ...baseStyle, cursor: "pointer" }}
//     >
//       {/* Header */}
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
//         <Newspaper size={18} color="#fb923c" />
//         <span>Top News</span>
//       </motion.div>

//       {/* News Item */}
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={currentIndex}
//           initial={{ opacity: 0, x: -10 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 10 }}
//           transition={{ duration: 0.4 }}
//           style={{
//             marginBottom: '16px',
//           }}
//         >
//           <div style={{
//             fontSize: '14px',
//             lineHeight: '1.4',
//             marginBottom: '8px',
//             fontWeight: '500',
//           }}>
//             {news[currentIndex]?.title}
//           </div>
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             fontSize: '12px',
//             opacity: 0.8,
//           }}>
//             <span>{news[currentIndex]?.source}</span>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
//               <Clock size={12} />
//               <span>{formatTime(news[currentIndex]?.publishedAt)}</span>
//             </div>
//           </div>
//         </motion.div>
//       </AnimatePresence>

//       {/* Navigation */}
//       <div
//         onClick={nextNews}
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: '6px',
//           fontSize: '12px',
//           opacity: 0.8,
//           cursor: 'pointer',
//           marginTop: '10px',
//         }}
//       >
//         <span>Next</span>
//         <ArrowRight size={14} color="#fb923c" />
//       </div>
//     </motion.div>
//   );
// };

// export default NewsWidget;
'use client'


import React from 'react';
import { Menu } from 'lucide-react';

const TopNews: React.FC = () => {
  const newsItems = [
    'Fed signals rate stability ahead',
    'Tech stocks rally continues',
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
        <Menu size={20} />
        <span>Top News</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {newsItems.map((item, index) => (
          <div
            key={index}
            style={{
              fontSize: '14px',
              lineHeight: 1.4,
              color: '#1a202c',
              padding: '4px 0',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0';
              e.currentTarget.style.paddingLeft = '8px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.paddingLeft = '0';
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopNews;