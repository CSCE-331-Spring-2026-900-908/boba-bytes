import React from "react";

function Reports() {

    return (
        <div className="emp-management">
            <div className="emp-header">
                <h2>Reports</h2>

                <div className="reportDetail flex items-center gap-5 px-4 py-3">
                    <label htmlFor="reportType" className="font-semibold text-slate-600 whitespace-nowrap">
                        Type:
                    </label>
                    <select
                        id="reportType"
                        className="min-w-0 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="sales">Sales Report</option>
                        <option value="inventory">Inventory Report</option>
                        <option value="employee">Employee Performance Report</option>
                    </select>
                </div>

                <button
                    className = "btn-add"
                >
                    Generate Report
                </button>
            </div>
            <div className="">

            </div>
        </div>
    );
}

export default Reports;