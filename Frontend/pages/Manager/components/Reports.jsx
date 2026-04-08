import React, { useEffect, useState } from "react";
import { API_BASE } from "../../../config/api.js";

export default function Reports() {
    const [report, setReport] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE}/reports`)
            .then(res => res.json())
            .then(data => setReport(data))
            .catch(err => console.error("Failed to load reports:", err));
    }, []);

    return (
        <div>
            <h2>Reports</h2>

            <ul>
                {report.map((r, i) => (
                    <li key={i}>{r.description}</li>
                ))}
            </ul>
        </div>
    );
}
