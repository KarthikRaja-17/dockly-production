
// 'use client';
// import React, { useEffect, useState } from 'react';
// import { Card, Typography, Row, Col, Avatar } from 'antd';
// import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, Building2 } from 'lucide-react';
// import { getAccounts } from '../../services/apiConfig';
// import { useRouter } from 'next/navigation';

// const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// const { Title, Text } = Typography;

// type AccountItem = {
//   name: string;
//   type: string;
//   value: number;
//   color?: string;
// };

// type Section = {
//   title: string;
//   items: AccountItem[];
// };

// const AccountsOverview = () => {
//   const [sections, setSections] = useState<Section[]>([]);
//   const [netWorth, setNetWorth] = useState(0);
//   const [assets, setAssets] = useState(0);
//   const [liabilities, setLiabilities] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
//   const [username, setUsername] = useState('');

//   useEffect(() => {
//     const storedUsername = localStorage.getItem('username') || '';
//     setUsername(storedUsername);
//   }, []);

//   const formatCurrency = (amount: number) =>
//     `${amount < 0 ? '-' : ''}$${Math.abs(amount).toLocaleString(undefined, {
//       minimumFractionDigits: 2,
//     })}`;

//   useEffect(() => {
//     const fetchAccounts = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const res = await getAccounts({});
//         const { payload } = res.data;
//         setNetWorth(payload.total_balance || 0);
//         setAssets(payload.assets || 0);
//         setLiabilities(payload.liabilities || 0);
//         setSections(payload.sections || []);
//       } catch (err) {
//         console.error('Error fetching account data', err);
//         setError('Failed to load account data');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAccounts();
//   }, []);

//   const handleManageAccounts = () => {
//     router.push(`/${username}/finance-hub/setup`);
//   };

//   const getAccountIcon = (type: string, name: string) => {
//     const lowerType = type.toLowerCase();
//     const lowerName = name.toLowerCase();
    
//     if (lowerName.includes('credit') || lowerType.includes('credit')) return <CreditCard size={12} />;
//     if (lowerType.includes('investment') || lowerType.includes('retirement')) return <TrendingUp size={12} />;
//     if (lowerType.includes('bank') || lowerType.includes('checking')) return <Building2 size={12} />;
//     if (lowerType.includes('savings')) return <PiggyBank size={12} />;
//     return <Wallet size={12} />;
//   };

//   if (loading) {
//     return (
//       <Card
//         style={{
//           borderRadius: 20,
//           // marginLeft: -2,
//           width: '100%',
//           boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
//           border: 'none',
//           fontFamily: FONT_FAMILY,
//           background: '#ffffff',
//           overflow: 'hidden',
//           position: 'relative' as const,
//           minHeight: 400,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <div style={{ textAlign: 'center', color: '#111827' }}>
//           <div style={{
//             width: 40,
//             height: 40,
//             border: '3px solid rgba(0, 0, 0, 0.3)',
//             borderTop: '3px solid #667eea',
//             borderRadius: '50%',
//             animation: 'spin 1s linear infinite',
//             margin: '0 auto 16px',
//           }} />
//           <Text style={{ color: '#111827', fontFamily: FONT_FAMILY, fontSize: '16px' }}>
//             Loading account data...
//           </Text>
//         </div>
//         <style>{`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}</style>
//       </Card>
//     );
//   }

//   if (error) {
//     return (
//       <Card
//         style={{
//           borderRadius: 20,
//           // marginLeft: 8,
//           width: '100%',
//           boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
//           border: 'none',
//           fontFamily: FONT_FAMILY,
//           background: '#ffffff',
//           overflow: 'hidden',
//           position: 'relative' as const,
//           minHeight: 200,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <div style={{ textAlign: 'center', color: '#111827' }}>
//           <Text style={{ color: '#ef4444', fontFamily: FONT_FAMILY, fontSize: '16px', fontWeight: 600 }}>
//             {error}
//           </Text>
//           <button
//             onClick={() => window.location.reload()}
//             style={{
//               marginTop: 12,
//               padding: '8px 16px',
//               background: '#667eea',
//               border: 'none',
//               borderRadius: 8,
//               color: '#ffffff',
//               cursor: 'pointer',
//               fontFamily: FONT_FAMILY,
//               fontSize: '14px',
//               fontWeight: 500,
//             }}
//           >
//             Retry
//           </button>
//         </div>
//       </Card>
//     );
//   }

//   return (
//     <Card
//       style={{
//         borderRadius: 20,
//         // marginLeft: 8,
//         width: '100%',
//         boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
//         border: 'none',
//         fontFamily: FONT_FAMILY,
//         background: '#ffffff',
//         overflow: 'hidden',
//         position: 'relative' as const,
//         height: 360,
//       }}
//     >
//       <div style={{ position: 'relative' as const, zIndex: 1 }}>
//         {/* Header with Title and Net Worth on same line */}
//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'space-between', 
//           alignItems: 'center',
//           marginBottom: 20,
//           padding: '0 4px'
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             <div style={{
//               background: '#f3f4f6',
//               borderRadius: 8,
//               padding: 6,
//             }}>
//               <Wallet size={16} style={{ color: '#111827' }} />
//             </div>
//             <Title
//               level={4}
//               style={{
//                 margin: 0,
//                 fontFamily: FONT_FAMILY,
//                 fontSize: '18px',
//                 fontWeight: 700,
//                 color: '#111827',
//               }}
//             >
//               Accounts & Net Worth
//             </Title>
//           </div>
          
//           {/* Net Worth on the same line */}
//           <div style={{ textAlign: 'right' }}>
//             <div style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 4,
//               justifyContent: 'flex-end',
//               marginBottom: 2,
//             }}>
//               <div style={{
//                 width: 4,
//                 height: 4,
//                 borderRadius: '50%',
//                 background: netWorth >= 0 ? '#10b981' : '#ef4444',
//               }} />
//               <Text
//                 style={{
//                   fontFamily: FONT_FAMILY,
//                   fontSize: '11px',
//                   color: '#6b7280',
//                   fontWeight: 500,
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.3px',
//                 }}
//               >
//                 Total Net Worth
//               </Text>
//             </div>
//             <Title
//               level={3}
//               style={{
//                 color: '#111827',
//                 fontFamily: FONT_FAMILY,
//                 fontSize: '24px',
//                 fontWeight: 800,
//                 margin: 0,
//                 letterSpacing: '-0.5px',
//               }}
//             >
//               {formatCurrency(netWorth)}
//             </Title>
//           </div>
//         </div>

//         {/* Assets and Liabilities - Compact Design */}
//         <Row gutter={16} style={{ display: 'flex', alignItems: 'stretch' }}>
//           {/* Assets Section */}
//           <Col span={12} style={{ display: 'flex' }}>
//             <div
//               style={{
//                 background: '#ffffff',
//                 borderRadius: 12,
//                 padding: 16,
//                 border: '1px solid #e5e7eb',
//                 flex: 1,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
//               }}
//             >
//               <div style={{ 
//                 display: 'flex', 
//                 alignItems: 'center', 
//                 justifyContent: 'space-between',
//                 marginBottom: 12,
//               }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   <div style={{
//                     background: '#10b981',
//                     borderRadius: 6,
//                     padding: 4,
//                   }}>
//                     <TrendingUp size={14} style={{ color: '#ffffff' }} />
//                   </div>
//                   <Text
//                     style={{
//                       fontFamily: FONT_FAMILY,
//                       fontSize: '13px',
//                       fontWeight: 600,
//                       color: '#111827',
//                     }}
//                   >
//                     Assets
//                   </Text>
//                 </div>
//                 <Text
//                   style={{
//                     color: '#10b981',
//                     fontFamily: FONT_FAMILY,
//                     fontSize: '16px',
//                     fontWeight: 700,
//                   }}
//                 >
//                   {formatCurrency(assets)}
//                 </Text>
//               </div>
              
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
//               <div style={{ 
//                 display: 'flex', 
//                 flexDirection: 'column', 
//                 gap: 6, 
//                 flex: 1,
//                 maxHeight: '180px',
//                 overflowY: 'auto',
//                 paddingRight: '4px',
//               }}>
//                 {sections
//                   .filter(
//                     (section) =>
//                       section.title.toLowerCase().includes('asset') ||
//                       section.title.toLowerCase().includes('cash') ||
//                       section.title.toLowerCase().includes('saving') ||
//                       section.title.toLowerCase().includes('investment')
//                   )
//                   .map((section) =>
//                     section.items.map((item, idx) => (
//                       <div
//                         key={`asset-${idx}`}
//                         style={{
//                           display: 'flex',
//                           justifyContent: 'space-between',
//                           alignItems: 'center',
//                           padding: '8px 10px',
//                           background: '#f9fafb',
//                           borderRadius: 8,
//                           border: '1px solid #f3f4f6',
//                           transition: 'all 0.2s ease',
//                           cursor: 'pointer',
//                           minHeight: '36px',
//                           flexShrink: 0,
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.transform = 'translateY(-1px)';
//                           e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
//                           e.currentTarget.style.background = '#f3f4f6';
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.transform = 'translateY(0)';
//                           e.currentTarget.style.boxShadow = 'none';
//                           e.currentTarget.style.background = '#f9fafb';
//                         }}
//                       >
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                           <div style={{
//                             background: '#10b981',
//                             borderRadius: 6,
//                             width: 24,
//                             height: 24,
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                           }}>
//                             <span style={{
//                               color: '#ffffff',
//                               fontSize: '10px',
//                               fontWeight: 700,
//                             }}>
//                               {item.name.charAt(0).toUpperCase()}
//                             </span>
//                           </div>
//                           <div>
//                             <Text
//                               style={{
//                                 fontWeight: 500,
//                                 fontFamily: FONT_FAMILY,
//                                 fontSize: '11px',
//                                 color: '#111827',
//                                 display: 'block',
//                                 lineHeight: 1.2,
//                               }}
//                             >
//                               {item.name}
//                             </Text>
//                             <Text
//                               style={{
//                                 fontSize: '9px',
//                                 fontFamily: FONT_FAMILY,
//                                 color: '#6b7280',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: 3,
//                               }}
//                             >
//                               {getAccountIcon(item.type, item.name)}
//                               {item.type}
//                             </Text>
//                           </div>
//                         </div>
//                         <Text
//                           style={{
//                             color: '#10b981',
//                             fontFamily: FONT_FAMILY,
//                             fontSize: '11px',
//                             fontWeight: 600,
//                           }}
//                         >
//                           {formatCurrency(Math.abs(item.value))}
//                         </Text>
//                       </div>
//                     ))
//                   )}
//               </div>
//               </div>
//             </div>
//           </Col>

//           {/* Liabilities Section */}
//           <Col span={12} style={{ display: 'flex' }}>
//             <div
//               style={{
//                 background: '#ffffff',
//                 borderRadius: 12,
//                 padding: 16,
//                 border: '1px solid #e5e7eb',
//                 flex: 1,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
//               }}
//             >
//               <div style={{ 
//                 display: 'flex', 
//                 alignItems: 'center', 
//                 justifyContent: 'space-between',
//                 marginBottom: 12,
//               }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   <div style={{
//                     background: '#ef4444',
//                     borderRadius: 6,
//                     padding: 4,
//                   }}>
//                     <TrendingDown size={14} style={{ color: '#ffffff' }} />
//                   </div>
//                   <Text
//                     style={{
//                       fontFamily: FONT_FAMILY,
//                       fontSize: '13px',
//                       fontWeight: 600,
//                       color: '#111827',
//                     }}
//                   >
//                     Liabilities
//                   </Text>
//                 </div>
//                 <Text
//                   style={{
//                     color: '#ef4444',
//                     fontFamily: FONT_FAMILY,
//                     fontSize: '16px',
//                     fontWeight: 700,
//                   }}
//                 >
//                   -{formatCurrency(Math.abs(liabilities))}
//                 </Text>
//               </div>
              
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
//               <div style={{ 
//                 display: 'flex', 
//                 flexDirection: 'column', 
//                 gap: 6, 
//                 flex: 1,
//                 maxHeight: '180px',
//                 overflowY: 'auto',
//                 paddingRight: '4px',
//               }}>
//                 {sections
//                   .filter(
//                     (section) =>
//                       section.title.toLowerCase().includes('liabilit') ||
//                       section.title.toLowerCase().includes('debt') ||
//                       section.title.toLowerCase().includes('loan') ||
//                       section.title.toLowerCase().includes('credit')
//                   )
//                   .map((section) =>
//                     section.items.map((item, idx) => (
//                       <div
//                         key={`liability-${idx}`}
//                         style={{
//                           display: 'flex',
//                           justifyContent: 'space-between',
//                           alignItems: 'center',
//                           padding: '8px 10px',
//                           background: '#f9fafb',
//                           borderRadius: 8,
//                           border: '1px solid #f3f4f6',
//                           transition: 'all 0.2s ease',
//                           cursor: 'pointer',
//                           minHeight: '36px',
//                           flexShrink: 0,
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.transform = 'translateY(-1px)';
//                           e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
//                           e.currentTarget.style.background = '#f3f4f6';
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.transform = 'translateY(0)';
//                           e.currentTarget.style.boxShadow = 'none';
//                           e.currentTarget.style.background = '#f9fafb';
//                         }}
//                       >
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                           <div style={{
//                             background: '#ef4444',
//                             borderRadius: 6,
//                             width: 24,
//                             height: 24,
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                           }}>
//                             <span style={{
//                               color: '#ffffff',
//                               fontSize: '10px',
//                               fontWeight: 700,
//                             }}>
//                               {item.name.charAt(0).toUpperCase()}
//                             </span>
//                           </div>
//                           <div>
//                             <Text
//                               style={{
//                                 fontWeight: 500,
//                                 fontFamily: FONT_FAMILY,
//                                 fontSize: '11px',
//                                 color: '#111827',
//                                 display: 'block',
//                                 lineHeight: 1.2,
//                               }}
//                             >
//                               {item.name}
//                             </Text>
//                             <Text
//                               style={{
//                                 fontSize: '9px',
//                                 fontFamily: FONT_FAMILY,
//                                 color: '#6b7280',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: 3,
//                               }}
//                             >
//                               {getAccountIcon(item.type, item.name)}
//                               {item.type}
//                             </Text>
//                           </div>
//                         </div>
//                         <Text
//                           style={{
//                             color: '#ef4444',
//                             fontFamily: FONT_FAMILY,
//                             fontSize: '11px',
//                             fontWeight: 600,
//                           }}
//                         >
//                           -{formatCurrency(Math.abs(item.value))}
//                         </Text>
//                       </div>
//                     ))
//                   )}
//               </div>
//               </div>
//             </div>
//           </Col>
//         </Row>
//       </div>
//     </Card>
//   );
// };

// export default AccountsOverview;


'use client';
import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Avatar } from 'antd';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, Building2 } from 'lucide-react';
import { getAccounts } from '../../services/apiConfig';
import { useRouter } from 'next/navigation';

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const { Title, Text } = Typography;

type AccountItem = {
  name: string;
  type: string;
  value: number;
  color?: string;
};

type Section = {
  title: string;
  items: AccountItem[];
};

const AccountsOverview = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [netWorth, setNetWorth] = useState(0);
  const [assets, setAssets] = useState(0);
  const [liabilities, setLiabilities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || '';
    setUsername(storedUsername);
  }, []);

  const formatCurrency = (amount: number) =>
    `${amount < 0 ? '-' : ''}$${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAccounts({});
        const { payload } = res.data;
        setNetWorth(payload.total_balance || 0);
        setAssets(payload.assets || 0);
        setLiabilities(payload.liabilities || 0);
        setSections(payload.sections || []);
      } catch (err) {
        console.error('Error fetching account data', err);
        setError('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleManageAccounts = () => {
    router.push(`/${username}/finance-hub/setup?mode=manage`);
  };

  const getAccountIcon = (type: string, name: string) => {
    const lowerType = type.toLowerCase();
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('credit') || lowerType.includes('credit')) return <CreditCard size={12} />;
    if (lowerType.includes('investment') || lowerType.includes('retirement')) return <TrendingUp size={12} />;
    if (lowerType.includes('bank') || lowerType.includes('checking')) return <Building2 size={12} />;
    if (lowerType.includes('savings')) return <PiggyBank size={12} />;
    return <Wallet size={12} />;
  };

  if (loading) {
    return (
      <Card
        style={{
          borderRadius: 20,
          // marginLeft: -2,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
          border: 'none',
          fontFamily: FONT_FAMILY,
          background: '#ffffff',
          overflow: 'hidden',
          position: 'relative' as const,
          minHeight: 400,
          display: 'flex',
          // marginTop: '12px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', color: '#111827' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(0, 0, 0, 0.3)',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <Text style={{ color: '#111827', fontFamily: FONT_FAMILY, fontSize: '16px' }}>
            Loading account data...
          </Text>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        style={{
          borderRadius: 20,
          // marginLeft: 8,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
          border: 'none',
          fontFamily: FONT_FAMILY,
          background: '#ffffff',
          overflow: 'hidden',
          position: 'relative' as const,
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', color: '#111827' }}>
          <Text style={{ color: '#ef4444', fontFamily: FONT_FAMILY, fontSize: '16px', fontWeight: 600 }}>
            {error}
          </Text>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              background: '#667eea',
              border: 'none',
              borderRadius: 8,
              color: '#ffffff',
              cursor: 'pointer',
              fontFamily: FONT_FAMILY,
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      style={{
        borderRadius: 20,
        // marginLeft: 8,
        width: '100%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
        border: 'none',
        fontFamily: FONT_FAMILY,
        background: '#ffffff',
        overflow: 'hidden',
        position: 'relative' as const,
        height: 360,
      }}
    >
      <div style={{ position: 'relative' as const, zIndex: 1 }}>
        {/* Header with Title and Net Worth on same line */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 20,
          padding: '0 4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              background: '#f3f4f6',
              borderRadius: 8,
              padding: 6,
            }}>
              <Wallet size={16} style={{ color: '#111827' }} />
            </div>
            <Title
              level={4}
              style={{
                margin: 0,
                fontFamily: FONT_FAMILY,
                fontSize: '18px',
                fontWeight: 700,
                color: '#111827',
              }}
            >
              Accounts & Net Worth
            </Title>
          </div>
          
          {/* Net Worth on the same line */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              justifyContent: 'flex-end',
              marginBottom: 2,
            }}>
              <div style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: netWorth >= 0 ? '#10b981' : '#ef4444',
              }} />
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '11px',
                  color: '#6b7280',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                }}
              >
                Total Net Worth
              </Text>
            </div>
            <Title
              level={3}
              style={{
                color: '#111827',
                fontFamily: FONT_FAMILY,
                fontSize: '24px',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              {formatCurrency(netWorth)}
            </Title>
          </div>
        </div>

        {/* Assets and Liabilities - Compact Design */}
        <Row gutter={16} style={{ display: 'flex', alignItems: 'stretch' }}>
          {/* Assets Section */}
          <Col span={12} style={{ display: 'flex' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 12,
                padding: 16,
                border: '1px solid #e5e7eb',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    background: '#10b981',
                    borderRadius: 6,
                    padding: 4,
                  }}>
                    <TrendingUp size={14} style={{ color: '#ffffff' }} />
                  </div>
                  <Text
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    Assets
                  </Text>
                </div>
                <Text
                  style={{
                    color: '#10b981',
                    fontFamily: FONT_FAMILY,
                    fontSize: '16px',
                    fontWeight: 700,
                  }}
                >
                  {formatCurrency(assets)}
                </Text>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 6, 
                flex: 1,
                maxHeight: '180px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}>
                {sections
                  .filter(
                    (section) =>
                      section.title.toLowerCase().includes('asset') ||
                      section.title.toLowerCase().includes('cash') ||
                      section.title.toLowerCase().includes('saving') ||
                      section.title.toLowerCase().includes('investment')
                  )
                  .map((section) =>
                    section.items.map((item, idx) => (
                      <div
                        key={`asset-${idx}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          background: '#f9fafb',
                          borderRadius: 8,
                          border: '1px solid #f3f4f6',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          minHeight: '36px',
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                          e.currentTarget.style.background = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.background = '#f9fafb';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            background: '#10b981',
                            borderRadius: 6,
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{
                              color: '#ffffff',
                              fontSize: '10px',
                              fontWeight: 700,
                            }}>
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <Text
                              style={{
                                fontWeight: 500,
                                fontFamily: FONT_FAMILY,
                                fontSize: '11px',
                                color: '#111827',
                                display: 'block',
                                lineHeight: 1.2,
                              }}
                            >
                              {item.name}
                            </Text>
                            <Text
                              style={{
                                fontSize: '9px',
                                fontFamily: FONT_FAMILY,
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                              }}
                            >
                              {getAccountIcon(item.type, item.name)}
                              {item.type}
                            </Text>
                          </div>
                        </div>
                        <Text
                          style={{
                            color: '#10b981',
                            fontFamily: FONT_FAMILY,
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {formatCurrency(Math.abs(item.value))}
                        </Text>
                      </div>
                    ))
                  )}
              </div>
              </div>
            </div>
          </Col>

          {/* Liabilities Section */}
          <Col span={12} style={{ display: 'flex' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 12,
                padding: 16,
                border: '1px solid #e5e7eb',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    background: '#ef4444',
                    borderRadius: 6,
                    padding: 4,
                  }}>
                    <TrendingDown size={14} style={{ color: '#ffffff' }} />
                  </div>
                  <Text
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    Liabilities
                  </Text>
                </div>
                <Text
                  style={{
                    color: '#ef4444',
                    fontFamily: FONT_FAMILY,
                    fontSize: '16px',
                    fontWeight: 700,
                  }}
                >
                  -{formatCurrency(Math.abs(liabilities))}
                </Text>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 6, 
                flex: 1,
                maxHeight: '180px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}>
                {sections
                  .filter(
                    (section) =>
                      section.title.toLowerCase().includes('liabilit') ||
                      section.title.toLowerCase().includes('debt') ||
                      section.title.toLowerCase().includes('loan') ||
                      section.title.toLowerCase().includes('credit')
                  )
                  .map((section) =>
                    section.items.map((item, idx) => (
                      <div
                        key={`liability-${idx}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          background: '#f9fafb',
                          borderRadius: 8,
                          border: '1px solid #f3f4f6',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          minHeight: '36px',
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                          e.currentTarget.style.background = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.background = '#f9fafb';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            background: '#ef4444',
                            borderRadius: 6,
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{
                              color: '#ffffff',
                              fontSize: '10px',
                              fontWeight: 700,
                            }}>
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <Text
                              style={{
                                fontWeight: 500,
                                fontFamily: FONT_FAMILY,
                                fontSize: '11px',
                                color: '#111827',
                                display: 'block',
                                lineHeight: 1.2,
                              }}
                            >
                              {item.name}
                            </Text>
                            <Text
                              style={{
                                fontSize: '9px',
                                fontFamily: FONT_FAMILY,
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                              }}
                            >
                              {getAccountIcon(item.type, item.name)}
                              {item.type}
                            </Text>
                          </div>
                        </div>
                        <Text
                          style={{
                            color: '#ef4444',
                            fontFamily: FONT_FAMILY,
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          -{formatCurrency(Math.abs(item.value))}
                        </Text>
                      </div>
                    ))
                  )}
              </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default AccountsOverview;
