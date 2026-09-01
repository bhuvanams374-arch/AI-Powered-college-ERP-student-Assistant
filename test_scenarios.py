#!/usr/bin/env python3
"""
Automated Test Suite for the 6 Demonstration Scenarios:
1. "What is my attendance?" -> Attendance Agent
2. "When is my next exam?" -> Exam Agent
3. "How much fee is pending?" -> Fee Agent
4. "What courses am I enrolled in?" -> Student Agent
5. "What is the minimum attendance required?" -> Policy Agent (Pinecone RAG)
6. "What is today's timetable?" -> Student Agent (Timetable)
"""
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from backend.agents.coordinator import coordinator

def run_tests():
    scenarios = [
        {
            "id": 1,
            "student_id": "STU001",
            "question": "What is my attendance percentage?",
            "expected_agent": "Attendance Agent"
        },
        {
            "id": 2,
            "student_id": "STU001",
            "question": "When is my next exam?",
            "expected_agent": "Exam Agent"
        },
        {
            "id": 3,
            "student_id": "STU001",
            "question": "How much fee is pending?",
            "expected_agent": "Fee Agent"
        },
        {
            "id": 4,
            "student_id": "STU001",
            "question": "What courses am I enrolled in?",
            "expected_agent": "Student Agent"
        },
        {
            "id": 5,
            "student_id": "STU001",
            "question": "What is the minimum attendance required by the college?",
            "expected_agent": "Policy Agent"
        },
        {
            "id": 6,
            "student_id": "STU001",
            "question": "What is today's timetable?",
            "expected_agent": "Student Agent"
        }
    ]

    print("\n" + "=" * 80)
    print("RUNNING MULTI-AGENT VERIFICATION FOR 6 MANDATORY DEMONSTRATION SCENARIOS")
    print("=" * 80 + "\n")

    passed = 0
    for s in scenarios:
        print(f"▶ SCENARIO {s['id']}: '{s['question']}'")
        res = coordinator.handle_query(student_id=s["student_id"], question=s["question"])
        
        agent_match = res["agent"] == s["expected_agent"]
        status_str = "✅ PASS" if agent_match else f"❌ FAIL (Got {res['agent']}, expected {s['expected_agent']})"
        if agent_match:
            passed += 1

        print(f"  • Routed To Agent  : {res['agent']} (Intent: {res['intent'].upper()})")
        print(f"  • Information Source: {res['source']}")
        print(f"  • Execution Latency: {res['latency_ms']}ms")
        print(f"  • Agent Response   :\n    {res['answer'][:160]}...")
        print(f"  • Verification     : {status_str}\n")

    print("=" * 80)
    print(f"RESULTS: {passed}/{len(scenarios)} Scenarios Passed Successfully.")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    run_tests()
