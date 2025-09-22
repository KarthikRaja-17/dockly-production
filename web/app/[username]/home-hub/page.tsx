'use client';
import React from 'react';
import { ConfigProvider, Card, Typography, Row, Col } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import MaintenanceSection from '../../../pages/home/maintainance';
import PropertySection from '../../../pages/home/PropertyInformation';
import UtilitiesSection from '../../../pages/home/utilities';
import BookmarkHub from '../../../pages/components/bookmarks';
import FileHub from '../../../pages/components/files';
import NotesLists from '../../../pages/family-hub/components/familyNotesLists';
import InsuranceSection from '../../../pages/home/insurance';
import PropertyAssets from '../../../pages/home/propertyassets';
import KeyContacts from '../../../pages/home/keycontacts';
const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const { Title, Text } = Typography;

function HomeManagementHeader() {
  const cardStyle: React.CSSProperties = {
    marginBottom: "0.75rem",
    borderRadius: 6,
    marginTop: "2rem",
    boxShadow:
      "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    // padding: "1.5rem 2rem",
    height: "120px",
    marginLeft: "2rem",
    display: "flex",
    alignItems: "center",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    width: "100%",
  };

  const iconWrapper: React.CSSProperties = {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    // backgroundColor: "#5e60f1ff", // Indigo-500
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "26px",
    fontWeight: 600,
    color: "#262626",
    fontFamily: FONT_FAMILY,
  };

  const descStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
    fontFamily: FONT_FAMILY,
  };

  return (
    <Card style={cardStyle}>
      <div style={headerStyle}>
        <div style={iconWrapper}>
          <span role="img" aria-label="home" style={{ fontSize: "22px", color: "#fff" }}>
           <HomeOutlined
                  style={{
                    color: "#10b981",
                    fontSize: "32px",
                  }}
                />
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Title level={4} style={titleStyle}>
            Home Management
          </Title>
          <Text style={descStyle}>Stay organized with property, maintenance, and essential records</Text>
        </div>
      </div>
    </Card>
  );
}


function App() {
  const containerStyle: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1.5rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", sans-serif',
    background: '#f8fafc',
    color: '#1e293b',
    lineHeight: 1.6,
    minHeight: '100vh',
    marginLeft: '2rem',
  };

  const mainGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    marginLeft: '2rem',
  };

  const secondaryGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    marginLeft: '2rem',
  };

  const infoSectionsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginLeft: '2rem',
  };

  const antdTheme = {
    token: {
      colorPrimary: '#2563eb',
      borderRadius: 6,
    },
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <div style={containerStyle}>
        <HomeManagementHeader />
        <div style={mainGridStyle}>
          <PropertyAssets uid={''} />
          <MaintenanceSection hasAdvancedFeatures={true} />
        </div>

        <div style={secondaryGridStyle}>
          <UtilitiesSection hasTabNavigation={true} />
          <InsuranceSection />
        </div>

        <div style={secondaryGridStyle}>
          <KeyContacts/>

          <NotesLists currentHub="Home" />
        </div>
        <div style={secondaryGridStyle}>
          <FileHub hubName="Home" title="Files" />
          <BookmarkHub hub={'Home'} />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
