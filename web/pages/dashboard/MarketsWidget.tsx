
"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
} from "lucide-react";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import { Modal, Input, Checkbox, List, message } from "antd";

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/* ───────── TYPES & CONSTANTS ───────── */
type Market = {
  symbol: string;
  price: number;
  change: number;
  changeValue: number;
  isPositive: boolean;
  volume: string;
};

const API_KEY = "d1cijv1r01qvlf608ce0d1cijv1r01qvlf608ceg";
const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "GOOGL"];
const MAX_MARKETS = 3;

const MarketsWidget: React.FC = () => {
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [favourites, setFavourites] = useState<string[]>(DEFAULT_SYMBOLS);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [checkedFavorites, setCheckedFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setResults] = useState<
    { symbol: string; description: string }[]
  >([]);

  const showNotification = (
    title: string,
    description: string,
    type: "warning" | "success" | "error"
  ) => {
    message[type](description);
  };

  const fetchMarketData = async () => {
    setIsUpdating(true);
    try {
      const allSymbols = Array.from(new Set([...symbols, ...favourites]));
      const data = await Promise.all(
        allSymbols.map(async (symbol) => {
          try {
            const response = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
            );
            const q = await response.json();
            const price = q.c ?? 0;
            const prevClose = q.pc ?? 0;
            const diff = price - prevClose;
            const pct = prevClose ? (diff / prevClose) * 100 : 0;

            return {
              symbol,
              price,
              change: pct,
              changeValue: diff,
              isPositive: pct >= 0,
              volume: "3.2B",
            };
          } catch (err) {
            console.error(`❌ Failed to fetch quote for ${symbol}`, err);
            return null;
          }
        })
      );
      const cleanedData = data.filter(Boolean) as Market[];
      setMarkets(cleanedData);
    } catch (e) {
      console.error("Fetching quotes failed:", e);
    }
    setIsUpdating(false);
  };

  useEffect(() => {
    let cancel = false;
    (async () => !cancel && (await fetchMarketData()))();
    const id = setInterval(() => !cancel && fetchMarketData(), 60_000);
    return () => {
      cancel = true;
      clearInterval(id);
    };
  }, [symbols, favourites]);

  useEffect(() => {
    if (!searchTerm.trim()) return setResults([]);
    const id = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/search?q=${searchTerm}&token=${API_KEY}`
        );
        const data = await response.json();
        setResults(
          data.result.slice(0, 10).map((x: any) => ({
            symbol: x.symbol,
            description: x.description,
          }))
        );
      } catch (e) {
        console.error("Symbol search failed:", e);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    const saved = localStorage.getItem("selected_symbols");
    if (saved) setSymbols(JSON.parse(saved));

    const favSaved = localStorage.getItem("favourite_symbols");
    if (favSaved) setFavourites(JSON.parse(favSaved));
  }, []);

  if (!markets.length) {
    return (
      <div
        className="widget-card"
        style={{
          padding: 20,
          textAlign: "center",
          color: "#64748b",
          fontFamily: FONT_FAMILY,
        }}
      >
        Loading market data…
      </div>
    );
  }

  return (
    <div
      className="widget-card market-card-hover"
      style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "16px",
        border: "1px solid #e2e8f0",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        opacity: 0,
        animation: "fadeInUp 0.6s ease-out 0.3s forwards",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ padding: 1, background: "#f0f9ff", borderRadius: 6 }}>
            <BarChart3 size={16} color="#0284c7" />
          </div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              margin: 0,
              fontFamily: FONT_FAMILY,
            }}
          >
            Markets
          </h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: isUpdating ? "#10b981" : "#6b7280",
              animation: isUpdating ? "pulse 1s infinite" : "none",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 9,
              color: "#10b981",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
            }}
          >
            <TrendingUp size={10} /> Live
          </div>
          <Edit
            style={{ color: "#64748b", cursor: "pointer" }}
            onClick={() => {
              setCheckedFavorites(symbols);
              const merged = Array.from(
                new Set([...favourites, ...symbols])
              ).slice(0, 15);
              setFavourites(merged);
              localStorage.setItem("favourite_symbols", JSON.stringify(merged));
              setModalOpen(true);
              setShowSearch(false);
              setSearchTerm("");
              setResults([]);
            }}
            size={16}
          />
        </div>
      </div>

      {/* Featured Market */}
      {markets
        .filter((m) => symbols.includes(m.symbol))
        .slice(0, 1)
        .map((m) => (
          <div
            key={m.symbol}
            style={{
              backgroundColor: m.isPositive ? "#f0fdf4" : "#fef2f2",
              borderRadius: "10px",
              padding: "7.5px",
              marginBottom: "8px",
              border: `1px solid ${m.isPositive ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            <p
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: "#1e293b",
                margin: "0 0 4px",
                fontFamily: FONT_FAMILY,
              }}
            >
              {m.symbol}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: m.isPositive ? "#10b981" : "#ef4444",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {m.price.toFixed(2)}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#64748b",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Active
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent: "flex-end",
                    marginBottom: 2,
                  }}
                >
                  {m.isPositive ? (
                    <ArrowUpRight size={10} style={{ color: "#10b981" }} />
                  ) : (
                    <ArrowDownRight size={10} style={{ color: "#ef4444" }} />
                  )}
                  <span
                    style={{
                      fontSize: 11,
                      color: m.isPositive ? "#10b981" : "#ef4444",
                      fontWeight: 600,
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {m.isPositive ? "+" : ""}
                    {m.change.toFixed(2)}%
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 9,
                    color: m.isPositive ? "#10b981" : "#ef4444",
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {m.isPositive ? "+" : ""}
                  {m.changeValue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}

      {/* Remaining Symbols */}
      {markets
        .filter((m) => symbols.includes(m.symbol))
        .slice(1)
        .map((m, i) => (
          <div
            key={m.symbol}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderTop: "1px solid #f1f5f9",
              borderBottom:
                i === markets.length - 2 ? "1px solid #f1f5f9" : "none",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                fontFamily: FONT_FAMILY,
              }}
            >
              {m.symbol}
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontWeight: 600,
                  fontFamily: FONT_FAMILY,
                }}
              >
                {m.price.toFixed(2)}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {m.isPositive ? (
                  <TrendingUp size={10} color="#10b981" />
                ) : (
                  <TrendingDown size={10} color="#ef4444" />
                )}
                <span
                  style={{
                    fontSize: 12,
                    color: m.isPositive ? "#10b981" : "#ef4444",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {m.isPositive ? "+" : ""}
                  {m.change.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}

      {/* MODAL */}
      <Modal
        title={
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              fontFamily: FONT_FAMILY,
            }}
          >
            Customize Market Watchlist
          </span>
        }
        open={isModalOpen}
        okText="Save"
        onOk={() => {
          if (checkedFavorites.length > MAX_MARKETS) {
            showNotification(
              "Limit reached",
              `You can track up to ${MAX_MARKETS} markets. Deselect one before saving.`,
              "warning"
            );
            return;
          }
          setSymbols(checkedFavorites);
          localStorage.setItem(
            "selected_symbols",
            JSON.stringify(checkedFavorites)
          );
          setModalOpen(false);
          setShowSearch(false);
          setSearchTerm("");
          setResults([]);
        }}
        onCancel={() => {
          setModalOpen(false);
          setShowSearch(false);
          setSearchTerm("");
          setResults([]);
        }}
        bodyStyle={{
          paddingTop: 12,
          paddingBottom: 0,
          fontFamily: FONT_FAMILY,
        }}
        style={{
          borderRadius: 12,
          fontFamily: FONT_FAMILY,
        }}
      >
        <div
          style={{
            opacity: 1,
            transform: "translateY(0)",
            transition: "all 0.25s ease",
            fontFamily: FONT_FAMILY,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setShowSearch(true)}
              style={{
                backgroundColor: "#1677ff",
                color: "#fff",
                border: "none",
                padding: "6px 14px",
                borderRadius: 6,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontFamily: FONT_FAMILY,
              }}
            >
              + Add More
            </button>
          </div>

          {showSearch && (
            <>
              <Input
                placeholder="Search symbol or company"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                style={{
                  marginBottom: 12,
                  fontFamily: FONT_FAMILY,
                }}
              />
              <div
                style={{
                  maxHeight: 150,
                  overflowY: "auto",
                  paddingRight: 6,
                  marginBottom: 16,
                  fontFamily: FONT_FAMILY,
                }}
              >
                {searchResults.map(({ symbol, description }) => (
                  <div
                    key={symbol}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 8px",
                      borderRadius: 6,
                      transition: "background 0.2s ease",
                      marginBottom: 6,
                      fontFamily: FONT_FAMILY,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f5f7fa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {symbol} {description && `- ${description}`}
                    </span>
                    <button
                      onClick={() => {
                        if (favourites.includes(symbol)) {
                          // Remove from favourites
                          const updatedFavs = favourites.filter(
                            (fav) => fav !== symbol
                          );
                          setFavourites(updatedFavs);
                          localStorage.setItem(
                            "favourite_symbols",
                            JSON.stringify(updatedFavs)
                          );
                          return;
                        }
                        if (favourites.length >= 15) {
                          showNotification(
                            "Limit reached",
                            "You can only add up to 15 favourites.",
                            "warning"
                          );
                          return;
                        }
                        const updatedFavs = [...favourites, symbol];
                        setFavourites(updatedFavs);
                        localStorage.setItem(
                          "favourite_symbols",
                          JSON.stringify(updatedFavs)
                        );
                      }}
                      style={{
                        border: favourites.includes(symbol)
                          ? "1px solid #ef4444"
                          : "1px solid #1677ff",
                        backgroundColor: "#fff",
                        color: favourites.includes(symbol)
                          ? "#ef4444"
                          : "#1677ff",
                        borderRadius: 4,
                        fontSize: 12,
                        padding: "3px 8px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {favourites.includes(symbol) ? "Remove" : "Add"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <h4
            style={{
              marginBottom: 12,
              fontWeight: 600,
              fontFamily: FONT_FAMILY,
            }}
          >
            Your Favourites
          </h4>
          <div
            style={{
              maxHeight: 280,
              overflowY: "auto",
              paddingRight: 6,
              fontFamily: FONT_FAMILY,
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={favourites}
              renderItem={(symbol) => {
                const marketData = markets.find((m) => m.symbol === symbol);
                const priceAvailable = marketData && !isNaN(marketData.price);
                const color = priceAvailable
                  ? marketData!.isPositive
                    ? "#10b981"
                    : "#ef4444"
                  : "#94a3b8";
                const priceText = priceAvailable
                  ? marketData!.price.toFixed(2)
                  : "--";
                const isChecked = checkedFavorites.includes(symbol);

                return (
                  <List.Item
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      marginBottom: 8,
                      background: "#f9fafb",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      transition: "all 0.2s ease",
                      fontFamily: FONT_FAMILY,
                    }}
                    actions={[
                      <span
                        key="price"
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color,
                          marginRight: 6,
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {priceText}
                      </span>,
                      <DeleteOutlined
                        key="delete"
                        onClick={() => {
                          if (favourites.length <= 1) {
                            showNotification(
                              "Action not allowed",
                              "You must have at least one item in your watchlist.",
                              "warning"
                            );
                            return;
                          }
                          const updated = favourites.filter((fav) => fav !== symbol);
                          setFavourites(updated);
                          setCheckedFavorites((prev) =>
                            prev.filter((item) => item !== symbol)
                          );
                          localStorage.setItem(
                            "favourite_symbols",
                            JSON.stringify(updated)
                          );
                        }}
                        style={{
                          color: "#ef4444",
                          fontSize: 16,
                          cursor: "pointer",
                        }}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Checkbox
                          checked={isChecked}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                              if (checkedFavorites.length >= MAX_MARKETS) {
                                showNotification(
                                  "Limit reached",
                                  `You can track up to ${MAX_MARKETS} markets. Deselect one before selecting another.`,
                                  "warning"
                                );
                                return;
                              }
                              setCheckedFavorites([...checkedFavorites, symbol]);
                            } else {
                              setCheckedFavorites(
                                checkedFavorites.filter((item) => item !== symbol)
                              );
                            }
                          }}
                        />
                      }
                      title={
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: 14,
                            fontFamily: FONT_FAMILY,
                          }}
                        >
                          {symbol}
                        </span>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      </Modal>

      <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: none; }
                }
                body, button, input, textarea {
                    font-family: ${FONT_FAMILY};
                }
            `}</style>
    </div>
  );
};

export default MarketsWidget;
