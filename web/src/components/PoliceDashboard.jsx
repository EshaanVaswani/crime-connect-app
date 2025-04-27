import { useEffect, useState } from "react";
import "./PoliceDashbaord.css";
import { io } from "socket.io-client";
import alertSound from "../assets/alert.mp3";
import useSound from "use-sound";

export default function PoliceDashboard() {
   const [reports, setReports] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [newAlert, setNewAlert] = useState(null);

   const [playAlert] = useSound(alertSound);
   const [socket, setSocket] = useState(null);

   useEffect(() => {
      const fetchReports = async () => {
         try {
            const response = await fetch(
               `${import.meta.env.VITE_PUBLIC_API_URL}/api/v1/reports`
            );

            if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setReports(data.data);
         } catch (err) {
            setError(
               err instanceof Error ? err.message : "Failed to fetch reports"
            );
         } finally {
            setLoading(false);
         }
      };

      const newSocket = io("http://localhost:3000");
      console.log(newSocket);

      setSocket(newSocket);

      newSocket.on("new_report", (report) => {
         playAlert();
         setNewAlert(report);
         setReports((prev) => [report, ...prev]);
      });

      fetchReports();

      return () => {
         newSocket.disconnect();
      };
   }, []);

   if (loading) {
      return <div className="loading">Loading reports...</div>;
   }

   if (error) {
      return <div className="error">Error: {error}</div>;
   }

   const dismissAlert = () => {
      setNewAlert(null);
   };

   return (
      <div className="dashboard">
         <h1>Police Dashboard</h1>

         {newAlert && (
            <div className="alert-banner">
               <span>
                  NEW ALERT: {newAlert.title} - {newAlert.location.address}
               </span>
               <button onClick={dismissAlert}>×</button>
            </div>
         )}

         <div className="reports-grid">
            <div className="grid-header">
               <div>Case</div>
               <div>Type</div>
               <div>Location</div>
               <div>Date</div>
               <div>Status</div>
            </div>

            {reports.map((report) => (
               <div key={report._id} className="report-row">
                  <div>{report.title}</div>
                  <div className={`type ${report.incidentType}`}>
                     {report.incidentType}
                  </div>
                  <div>{report.location.address}</div>
                  <div>{new Date(report.createdAt).toLocaleString()}</div>
                  <div className={`status ${report.status || "pending"}`}>
                     {report.status || "pending"}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
