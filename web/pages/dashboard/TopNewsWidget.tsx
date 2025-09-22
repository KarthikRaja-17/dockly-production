"use client";

import React, { useEffect, useState } from "react";
import { Typography, Button, Modal, message } from "antd";
import {
  Newspaper,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  Share,
  ExternalLink,
} from "lucide-react";
import { useGlobalLoading } from "../../app/loadingContext";

const { Text, Link } = Typography;
const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface Article {
  title: string;
  link: string;
  pubDate: string;
}

const RSS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";
const CATEGORY_KEYS = [
  "WORLD",
  "BUSINESS",
  "TECHNOLOGY",
  "ENTERTAINMENT",
  "SPORTS",
  "SCIENCE",
  "HEALTH",
];
const CATEGORY_LABELS: Record<string, string> = {
  WORLD: "World",
  BUSINESS: "Business",
  TECHNOLOGY: "Technology",
  ENTERTAINMENT: "Entertainment",
  SPORTS: "Sports",
  SCIENCE: "Science",
  HEALTH: "Health",
};

const TopNews: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [modalArticles, setModalArticles] = useState<Article[]>([]);
  const { loading, setLoading } = useGlobalLoading();
  const [bookmarked, setBookmarked] = useState(false);
  const [liveView, setLiveView] = useState(false);
  const [countryCode, setCountryCode] = useState("US");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState("");

  const toggleBookmark = () => setBookmarked((prev) => !prev);
  const toggleLive = () => setLiveView((prev) => !prev);

  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setCountryCode(
          data?.country_code || navigator.language.split("-")[1] || "US"
        );
      } catch {
        setCountryCode(navigator.language.split("-")[1] || "US");
      }
    };
    fetchCountryCode();
  }, []);

  const getFeedUrl = (category: string) => {
    const base = "https://news.google.com/rss";
    if (category === "FOR_YOU") {
      return `${base}?hl=en-${countryCode}&gl=${countryCode}&ceid=${countryCode}:en`;
    }
    return `${base}/headlines/section/topic/${category}?hl=en-${countryCode}&gl=${countryCode}&ceid=${countryCode}:en`;
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const url = getFeedUrl("FOR_YOU");
      const res = await fetch(`${RSS_PROXY}${encodeURIComponent(url)}`);
      const data = await res.json();
      setArticles(data.items.slice(0, 3));
    } catch {
      message.error("Error loading top news");
    } finally {
      setLoading(false);
    }
  };

  const fetchModalNews = async (category: string) => {
    setLoading(true);
    try {
      const url = getFeedUrl(category);
      const res = await fetch(`${RSS_PROXY}${encodeURIComponent(url)}`);
      const data = await res.json();
      setModalArticles(data.items.slice(0, 10));
      localStorage.setItem("preferredCategory", category);
    } catch {
      message.error("Error loading category news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [countryCode, liveView]);

  useEffect(() => {
    const saved = localStorage.getItem("preferredCategory");
    if (saved) setModalCategory(saved);
  }, []);

  const handleNewsClick = (newsLink: string) => {
    window.open(newsLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="widget-card"
      style={{
        fontFamily: FONT_FAMILY,
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        border: "1px solid #e2e8f0",
        position: "relative",
        overflow: "hidden",
        opacity: 0,
        animation: "fadeInUp 0.6s ease-out 0.3s forwards",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "transform",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ padding: 0.5, background: "#f1f5f9", borderRadius: 6 }}>
            <Newspaper size={14} color="#2e75d8ff" />
          </div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1e293b",
              margin: 0,
            }}
          >
            Top News
          </h3>
        </div>
        <div
          onClick={toggleLive}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 9,
            color: "#10b981",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <TrendingUp size={10} /> Live
        </div>
      </div>

      {!loading && articles.length > 0 && (
        <>
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 10,
              padding: 8,
              marginBottom: 10,
              border: "1px solid #0960da30",
              height: 78.5, // Shorter initial height
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#010a18ff",
                margin: "0 0 2px",
                lineHeight: "1.6em",
                height: "3.2em", // 3 lines height fixed
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {articles[0].title}
            </p>
            <div style={{ display: "flex", gap: 4, fontSize: 9, marginTop: 1 }}>
              <Button
                size="small"
                type="default"
                href={articles[0].link}
                target="_blank"
                icon={<ExternalLink size={10} />}
                style={{
                  fontSize: 8,
                  padding: "3px 3px",
                  height: "auto",
                  background: "#eff6ff",
                  border: "none",
                  color: "#3b82f6",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 500,
                }}
              >
                Read
              </Button>
            </div>
          </div>

          {articles.slice(1).map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "6px 8px",
                marginBottom: 4,
                borderLeft: "2px solid #10b981",
                backgroundColor: "#fff",
                borderRadius: "0 6px 6px 0",
                position: "relative",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#1e293b",
                  margin: "0 0 2px",
                  lineHeight: "1.4em",
                  height: "2.8em", // 1.4em * 2 lines
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.title}
              </p>

              <div style={{ fontSize: 8.5, color: "#64748b" }}>
                {new Date(item.pubDate).toLocaleTimeString()}
              </div>

              {idx === 1 && (
                <a
                  onClick={() => setModalOpen(true)}
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 8,
                    fontSize: 9.5,
                    color: "#3b82f6",
                    fontWeight: 500,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                  }}
                ></a>
              )}
            </div>
          ))}
        </>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 8,
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <a
          onClick={() => setModalOpen(true)}
          style={{
            fontSize: 10.5,
            color: "#3b82f6",
            fontWeight: 500,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
            marginTop: -5,
          }}
        >
          View all news <span style={{ fontSize: 9 }}>→</span>
        </a>
      </div>

      <Modal
        open={modalOpen}
        centered
        onCancel={() => {
          setModalOpen(false);
          setModalArticles([]);
        }}
        footer={null}
        title="Explore News by Category"
        bodyStyle={{
          maxHeight: "60vh",
          overflowY: "auto",
          paddingRight: "8px",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <select
            onChange={(e) => setModalCategory(e.target.value)}
            value={modalCategory}
            style={{
              width: "100%",
              padding: "0.4rem",
              fontSize: "0.85rem",
              borderRadius: 4,
              border: "1px solid #d9d9d9",
            }}
          >
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORY_KEYS.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          <Button
            type="primary"
            size="small"
            style={{ marginTop: 10, width: "100%" }}
            disabled={!modalCategory}
            onClick={() => fetchModalNews(modalCategory)}
          >
            Show News
          </Button>
        </div>

        {!loading && modalArticles.length > 0 && (
          <>
            {modalArticles.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleNewsClick(item.link)}
                style={{
                  marginBottom: 10,
                  paddingLeft: 6,
                  borderLeft: "3px solid #1890ff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  borderRadius: "0 4px 4px 0",
                  padding: "8px 6px",
                }}
                className="clickable-news-item"
              >
                <Text strong style={{ fontSize: 13 }}>
                  {item.title}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {new Date(item.pubDate).toLocaleString()}
                </Text>
              </div>
            ))}
            <div style={{ marginTop: 10, textAlign: "right" }}>
              <Link
                href={`https://news.google.com/headlines/section/topic/${modalCategory}?hl=en-${countryCode}&gl=${countryCode}&ceid=${countryCode}:en`}
                target="_blank"
              >
                View More →
              </Link>
            </div>
          </>
        )}
      </Modal>

      <style>{`
        .widget-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.6s ease-out 0.3s forwards;
          opacity: 0;
          transform: translateY(10px);
        }

        .widget-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transform: translateY(0);
        }

        .clickable-news-item:hover {
          background-color: #f8fafc;
          transform: translateX(2px);
          border-left-color: #0050b3 !important;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TopNews;
