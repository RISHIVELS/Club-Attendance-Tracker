import { useLoaderData, Link, useParams } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import jsPDF from "jspdf";

export const loader = async ({ params }) => {
  try {
    const { eventId } = params;
    console.log("Fetching reports for event:", eventId);

    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const res = await axios.get(`${baseURL}/api/v1/analytics/${eventId}`);
    console.log("Reports response:", res.data);

    return { reports: res.data };
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw new Response("Reports not found", { status: 404 });
  }
};

const Reports = () => {
  const { reports } = useLoaderData();
  const { eventId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate participation rate
  const participationRate =
    reports.totalTeamsCount > 0
      ? ((reports.presentTeamsCount / reports.totalTeamsCount) * 100).toFixed(0)
      : 0;

  // Chart data for attendance distribution (Donut Chart)
  const attendanceData = [
    { name: "Present", value: reports.presentTeamsCount, color: "#10b981" },
    { name: "Absent", value: reports.absentTeamsCount, color: "#ef4444" },
  ];

  // Chart data for team attendance overview (Area Chart)
  const teamOverviewData = reports.totalTeams.map((team, index) => ({
    name: team.teamName,
    attendance: team.isPresent ? 100 : 0,
  }));

  // Filter teams based on search
  const filteredTeams = reports.totalTeams.filter(
    (team) =>
      team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const COLORS = ["#10b981", "#ef4444"];

  // Function to export PDF
  const exportToPDF = async () => {
    try {
      // Show loading state
      const button = document.querySelector(".export-pdf-btn");
      const originalText = button.innerHTML;
      button.innerHTML = `
      <span class="loading loading-spinner loading-sm"></span>
      Generating PDF...
    `;
      button.disabled = true;

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Load watermark image from public folder
      let watermarkImg = null;
      try {
        const response = await fetch("/college-watermark.png");
        const blob = await response.blob();
        watermarkImg = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.log("Watermark image not found, continuing without it");
      }

      // Function to add watermark to each page
      const addWatermark = () => {
        if (watermarkImg) {
          // Add watermark image (centered, large, transparent)
          pdf.setGState(new pdf.GState({ opacity: 0.08 }));
          const watermarkSize = 80;
          pdf.addImage(
            watermarkImg,
            "PNG",
            pageWidth / 2 - watermarkSize / 2,
            pageHeight / 2 - watermarkSize / 2,
            watermarkSize,
            watermarkSize
          );
          pdf.setGState(new pdf.GState({ opacity: 1.0 }));
        }

        // Add text watermark
        pdf.setGState(new pdf.GState({ opacity: 0.15 }));
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(30, 30, 30);
        pdf.text(
          "Sri Venkateswara College of Engineering, Sriperumbadur",
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
        pdf.setGState(new pdf.GState({ opacity: 1.0 }));
      };

      // Add watermark to first page
      addWatermark();

      // Title
      pdf.setFontSize(24);
      pdf.setTextColor(40, 40, 40);
      pdf.setFont(undefined, "normal");
      pdf.text(
        `Attendance Report - ${reports.event || "Viz-A-Thon"}`,
        pageWidth / 2,
        30,
        { align: "center" }
      );

      // Date
      pdf.setFontSize(14);
      pdf.setTextColor(120, 120, 120);
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
      pdf.text(`Generated on: ${date}`, pageWidth / 2, 42, {
        align: "center",
      });

      // Attendance Summary Section
      let yPos = 65;
      pdf.setFontSize(18);
      pdf.setTextColor(40, 40, 40);
      pdf.setFont(undefined, "bold");
      pdf.text("Attendance Summary", 20, yPos);

      yPos += 15;

      // Calculate percentages
      const presentPercentage =
        reports.totalTeamsCount > 0
          ? (
              (reports.presentTeamsCount / reports.totalTeamsCount) *
              100
            ).toFixed(1)
          : 0;
      const absentPercentage =
        reports.totalTeamsCount > 0
          ? (
              (reports.absentTeamsCount / reports.totalTeamsCount) *
              100
            ).toFixed(1)
          : 0;

      // Statistics - Left Column
      pdf.setFontSize(12);
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(40, 40, 40);

      pdf.text(`Total Teams: ${reports.totalTeamsCount}`, 20, yPos);
      yPos += 12;
      pdf.text(`Present Teams: ${reports.presentTeamsCount}`, 20, yPos);
      yPos += 12;
      pdf.text(`Absent Teams: ${reports.absentTeamsCount}`, 20, yPos);

      // Statistics - Right Column
      yPos = 80;
      pdf.text(`Present Rate: ${presentPercentage}%`, 120, yPos);
      yPos += 12;
      pdf.text(`Absent Rate: ${absentPercentage}%`, 120, yPos);

      // Team Attendance Details Section
      yPos = 125;
      pdf.setFontSize(18);
      pdf.setFont(undefined, "bold");
      pdf.text("Team Attendance Details", 20, yPos);

      yPos += 10;

      // Table Header
      pdf.setFillColor(66, 133, 244); // Blue header
      pdf.rect(20, yPos, pageWidth - 40, 12, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");

      pdf.text("Team Name", 22, yPos + 8);
      pdf.text("Leader", 65, yPos + 8);
      pdf.text("Email", 100, yPos + 8);
      pdf.text("Dept", 145, yPos + 8);
      pdf.text("Year", 163, yPos + 8);
      pdf.text("Status", 175, yPos + 8);

      yPos += 12;

      // Table Rows
      pdf.setFont(undefined, "normal");
      pdf.setFontSize(9);

      reports.totalTeams.forEach((team, index) => {
        // Check if we need a new page
        if (yPos > 270) {
          pdf.addPage();
          addWatermark(); // Add watermark to new page
          yPos = 20;

          // Redraw table header on new page
          pdf.setFillColor(66, 133, 244);
          pdf.rect(20, yPos, pageWidth - 40, 12, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.setFont(undefined, "bold");

          pdf.text("Team Name", 22, yPos + 8);
          pdf.text("Leader", 65, yPos + 8);
          pdf.text("Email", 100, yPos + 8);
          pdf.text("Dept", 145, yPos + 8);
          pdf.text("Year", 163, yPos + 8);
          pdf.text("Status", 175, yPos + 8);

          yPos += 12;
          pdf.setFont(undefined, "normal");
          pdf.setFontSize(9);
        }

        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(245, 245, 245);
        } else {
          pdf.setFillColor(255, 255, 255);
        }
        pdf.rect(20, yPos, pageWidth - 40, 10, "F");

        // Add border
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.1);
        pdf.rect(20, yPos, pageWidth - 40, 10, "S");

        pdf.setTextColor(40, 40, 40);

        // Team data with better spacing
        pdf.text(team.teamName.substring(0, 18), 22, yPos + 6.5);
        pdf.text(team.leaderName.substring(0, 14), 65, yPos + 6.5);
        pdf.text(team.email.substring(0, 22), 100, yPos + 6.5);
        pdf.text(team.department.substring(0, 7), 145, yPos + 6.5);
        pdf.text(String(team.year), 163, yPos + 6.5);

        // Status with color
        if (team.isPresent) {
          pdf.setTextColor(0, 150, 0); // Green
          pdf.text("Present", 175, yPos + 6.5);
        } else {
          pdf.setTextColor(220, 0, 0); // Red
          pdf.text("Absent", 175, yPos + 6.5);
        }

        pdf.setTextColor(40, 40, 40);
        yPos += 10;
      });

      // Add page numbers to all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(120, 120, 120);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 20, {
          align: "center",
        });
      }

      // Save PDF
      const fileName = `Attendance_Report_${
        reports.event?.replace(/\s+/g, "_") || "Event"
      }_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      // Restore button state
      button.innerHTML = originalText;
      button.disabled = false;
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");

      // Restore button state on error
      const button = document.querySelector(".export-pdf-btn");
      button.innerHTML =
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Export PDF';
      button.disabled = false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto">
        <div
          id="reports-content"
          className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  to={`/events/${eventId}`}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Attendance Reports
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Dashboard / {reports.event || "Viz-A-Thon"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={exportToPDF}
                  className="export-pdf-btn inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Top Section - 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Attendance Distribution - Donut Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Attendance Distribution
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Real-time check-in status
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
              <div
                className="flex items-center justify-center"
                style={{ height: "180px" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      label={false}
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {participationRate}%
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    Present
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Present</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {reports.presentTeamsCount}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">Absent</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {reports.absentTeamsCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Card - Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                        clipRule="evenodd"
                      />
                    </svg>
                    +0%
                  </span>
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {reports.totalTeamsCount}
                </div>
                <div className="text-sm text-gray-500">
                  Total Teams Registered
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Participation Rate</span>
                    <span className="font-semibold text-gray-900">
                      {participationRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${participationRate}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Overall session engagement
                </p>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-green-700 uppercase">
                      Present
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    {reports.presentTeamsCount}
                  </div>
                  <div className="flex items-end gap-1 h-12">
                    {[0.4, 0.6, 0.5, 0.8, 1].map((height, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-green-400 rounded-t"
                        style={{ height: `${height * 100}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-red-700 uppercase">
                      Absent
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-red-700 mb-2">
                    {reports.absentTeamsCount}
                  </div>
                  <div className="flex items-center justify-center h-12">
                    <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Attendance Overview Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Team Attendance Overview
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Comparative analysis by team
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={teamOverviewData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorAttendance"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAttendance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Team Attendance Details Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Team Attendance Details
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Comprehensive list of participants
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search team or leader..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                  <svg
                    className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Leader
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTeams.map((team) => {
                    const initials = team.teamName
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2);
                    return (
                      <tr key={team._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                              {initials}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {team.teamName}
                              </div>
                              <div className="text-xs text-gray-500 md:hidden">
                                {team.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-gray-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm text-gray-900">
                                {team.leaderName}
                              </div>
                              <div className="text-xs text-gray-500 hidden md:block">
                                {team.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                          {team.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                          {team.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {team.isPresent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Absent
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredTeams.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchQuery ? "No results found" : "No Teams Registered"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "No teams have registered for this event yet."}
                </p>
              </div>
            )}

            {/* Footer count */}
            {filteredTeams.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 text-xs text-gray-500">
                Showing {filteredTeams.length} of {reports.totalTeamsCount} team
                {reports.totalTeamsCount !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
