/**
 * Frontend JavaScript Controller for AI-Powered College ERP Student Assistant.
 * Connects to the FastAPI backend /ask and ERP endpoints.
 */

const API_BASE = window.location.port === "3000" ? "/api" : "http://localhost:8000";

let currentStudentId = "STU001";

// DOM Elements
const studentSelect = document.getElementById("studentSelect");
const studentBanner = document.getElementById("studentBanner");
const greetingStudentName = document.getElementById("greetingStudentName");
const askForm = document.getElementById("askForm");
const questionInput = document.getElementById("questionInput");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");

const agentTraceBox = document.getElementById("agentTraceBox");
const traceTimeline = document.getElementById("traceTimeline");
const traceLatency = document.getElementById("traceLatency");

const responseContainer = document.getElementById("responseContainer");
const respAgentName = document.getElementById("respAgentName");
const respSource = document.getElementById("respSource");
const respConfidence = document.getElementById("respConfidence");
const respAnswerText = document.getElementById("respAnswerText");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadStudentDetails(currentStudentId);
    setupEventListeners();
    loadTabContent("tab-attendance");
});

function setupEventListeners() {
    studentSelect.addEventListener("change", (e) => {
        currentStudentId = e.target.value;
        loadStudentDetails(currentStudentId);
        loadCurrentActiveTab();
    });

    askForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const question = questionInput.value.trim();
        if (!question) return;
        await submitQuestion(question);
    });

    document.querySelectorAll(".quick-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const q = btn.getAttribute("data-query");
            questionInput.value = q;
            submitQuestion(q);
        });
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            const tabId = btn.getAttribute("data-tab");
            const contentEl = document.getElementById(tabId);
            if (contentEl) contentEl.classList.add("active");
            loadTabContent(tabId);
        });
    });
}

async function loadStudentDetails(studentId) {
    try {
        const res = await fetch(`${API_BASE}/student/${studentId}`);
        if (!res.ok) throw new Error("Failed to load student");
        const data = await res.json();
        
        document.getElementById("studentName").textContent = `Student: ${data.name} (${data.student_id})`;
        document.getElementById("studentDept").textContent = `${data.department} • Semester ${data.semester}`;
        document.getElementById("studentStatus").textContent = `Status: ${data.status}`;
        document.getElementById("studentMentor").textContent = `Mentor: ${data.mentor}`;
        greetingStudentName.textContent = data.name.split(" ")[0];
    } catch (err) {
        console.error("Error loading student profile:", err);
    }
}

async function submitQuestion(question) {
    setLoading(true);
    responseContainer.classList.add("hidden");
    agentTraceBox.classList.remove("hidden");
    traceTimeline.innerHTML = `<div class="trace-step"><div class="trace-num">⚡</div><div class="trace-body"><span class="trace-agent-tag">Coordinator</span>: Routing query across multi-agent network...</div></div>`;

    try {
        const res = await fetch(`${API_BASE}/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student_id: currentStudentId,
                question: question
            })
        });

        if (!res.ok) {
            throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        renderResponse(data);
    } catch (err) {
        console.error("Query execution error:", err);
        respAgentName.textContent = "System Error Handler";
        respSource.textContent = "Error Log";
        respConfidence.textContent = "Error";
        respAnswerText.textContent = `Sorry, an error occurred while querying the multi-agent system: ${err.message}. Please verify the backend service is running.`;
        responseContainer.classList.remove("hidden");
    } finally {
        setLoading(false);
    }
}

function renderResponse(data) {
    respAgentName.textContent = data.agent || "Coordinator";
    respSource.textContent = `Source: ${data.source || 'ERP System'}`;
    respConfidence.textContent = `Confidence: ${Math.round((data.confidence || 0.95) * 100)}%`;
    respAnswerText.textContent = data.answer;
    responseContainer.classList.remove("hidden");

    // Render Trace
    traceLatency.textContent = `Latency: ${data.latency_ms}ms`;
    if (data.trace && data.trace.length > 0) {
        traceTimeline.innerHTML = data.trace.map(t => `
            <div class="trace-step">
                <div class="trace-num">${t.step}</div>
                <div class="trace-body">
                    <span class="trace-agent-tag">[${t.agent}]</span>
                    <span class="trace-desc">${t.action} (${t.details})</span>
                </div>
            </div>
        `).join("");
    }
}

function setLoading(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.textContent = "Processing...";
        btnSpinner.classList.remove("hidden");
    } else {
        submitBtn.disabled = false;
        btnText.textContent = "Ask AI Assistant";
        btnSpinner.classList.add("hidden");
    }
}

function loadCurrentActiveTab() {
    const activeTab = document.querySelector(".tab-btn.active");
    if (activeTab) {
        loadTabContent(activeTab.getAttribute("data-tab"));
    }
}

async function loadTabContent(tabId) {
    if (tabId === "tab-attendance") {
        try {
            const res = await fetch(`${API_BASE}/attendance/${currentStudentId}`);
            const data = await res.json();
            const rows = data.subjects.map(s => `
                <tr>
                    <td><strong>${s.subject}</strong><br><small style="color:var(--text-muted)">${s.course_code}</small></td>
                    <td>${s.classes_attended} / ${s.classes_held}</td>
                    <td><strong style="color: ${s.percentage >= 75 ? 'var(--success)' : 'var(--danger)'}">${s.percentage}%</strong></td>
                    <td>${s.status}</td>
                </tr>
            `).join("");
            document.getElementById("attendanceTableView").innerHTML = `
                <p style="margin-bottom:10px; font-weight:600;">Overall Attendance: <strong>${data.overall_percentage}%</strong> (${data.status})</p>
                <table class="erp-table">
                    <thead>
                        <tr><th>Subject</th><th>Classes</th><th>Percentage</th><th>Status</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        } catch (e) {
            document.getElementById("attendanceTableView").textContent = "Unable to load attendance table.";
        }
    } else if (tabId === "tab-exams") {
        try {
            const res = await fetch(`${API_BASE}/exams/${currentStudentId}`);
            const data = await res.json();
            const rows = data.schedules.map(s => `
                <tr>
                    <td><strong>${s.subject}</strong><br><small style="color:var(--text-muted)">${s.course_code}</small></td>
                    <td>${s.date} (${s.day})</td>
                    <td>${s.time}</td>
                    <td>${s.venue}</td>
                </tr>
            `).join("");
            document.getElementById("examsTableView").innerHTML = `
                <p style="margin-bottom:10px; font-weight:600;">Hall Ticket: <strong>${data.hall_ticket_status}</strong> (No: ${data.hall_ticket_no})</p>
                <table class="erp-table">
                    <thead>
                        <tr><th>Paper</th><th>Date</th><th>Timing</th><th>Venue</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        } catch (e) {
            document.getElementById("examsTableView").textContent = "Unable to load exam table.";
        }
    } else if (tabId === "tab-fees") {
        try {
            const res = await fetch(`${API_BASE}/fees/${currentStudentId}`);
            const data = await res.json();
            const rows = data.breakdown.map(b => `
                <tr>
                    <td>${b.head}</td>
                    <td>₹${b.total_amount.toLocaleString()}</td>
                    <td>₹${b.paid_amount.toLocaleString()}</td>
                    <td><strong style="color:${b.pending_amount > 0 ? 'var(--warning)' : 'var(--success)'}">₹${b.pending_amount.toLocaleString()}</strong></td>
                    <td>${b.due_date}</td>
                </tr>
            `).join("");
            document.getElementById("feesTableView").innerHTML = `
                <p style="margin-bottom:10px; font-weight:600;">Total Pending Dues: <strong style="color:var(--warning)">₹${data.total_pending.toLocaleString()}</strong> (Status: ${data.fee_status})</p>
                <table class="erp-table">
                    <thead>
                        <tr><th>Head</th><th>Total</th><th>Paid</th><th>Pending</th><th>Due Date</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        } catch (e) {
            document.getElementById("feesTableView").textContent = "Unable to load fee records.";
        }
    } else if (tabId === "tab-courses") {
        try {
            const res = await fetch(`${API_BASE}/courses/${currentStudentId}`);
            const data = await res.json();
            const rows = data.enrolled_courses.map(c => `
                <tr>
                    <td><strong>${c.title}</strong></td>
                    <td>${c.code}</td>
                    <td>${c.credits} Credits</td>
                    <td>${c.faculty}</td>
                    <td>${c.type}</td>
                </tr>
            `).join("");
            document.getElementById("coursesTableView").innerHTML = `
                <p style="margin-bottom:10px; font-weight:600;">Total Enrolled Credits: <strong>${data.total_credits}</strong> (Semester ${data.semester})</p>
                <table class="erp-table">
                    <thead>
                        <tr><th>Course Title</th><th>Code</th><th>Credits</th><th>Faculty</th><th>Type</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        } catch (e) {
            document.getElementById("coursesTableView").textContent = "Unable to load courses.";
        }
    }
}
