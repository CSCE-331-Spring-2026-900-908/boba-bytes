import React, { useEffect, useState } from "react";

export default function Reports() {
    const [report, setReport] = useState([]);

    useEffect(() => {
        fetch("/api/reports")
            .then(res => res.json())
            .then(data => setReport(data));
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
