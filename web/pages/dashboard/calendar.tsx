import React from "react";
// import RenderCalendarCard from "../components/customCalendar1";
import EventCarousel from "../components/eventCarousel";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface CalendarEventWidgetProps {
  events: any[];
  accountColor: any;
}

const CalendarEventWidget: React.FC<CalendarEventWidgetProps> = ({ events, accountColor }) => {
  return (
    <div
      style={{
        background: "#F9FAFB",
        borderRadius: 16,
        width: "55vw",
        maxWidth: "1200px",
        minWidth: "320px",
        margin: "0 auto",
        fontFamily: "Segoe UI, sans-serif",
        border: "1px solid #E5E7EB",
        boxSizing: "border-box",
      }}
    >
      {/* <RenderCalendarCard height={600} isCalendarPage={false} events={events} accountColor={accountColor} /> */}
      {/* <EventCarousel events={events} /> */}
    </div>
  );
};

export default CalendarEventWidget;

