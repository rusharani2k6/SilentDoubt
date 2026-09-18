import os
import sys
import asyncio
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import httpx
import websockets

BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000"

async def run_tests():
    print("=== STARTING SILENTDOUBT BACKEND E2E TEST ===")
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        # 1. Health check
        res = await client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("[PASS] 1. Health check passed")

        # 2. Login as Admin
        res = await client.post("/api/auth/login", json={
            "email": "admin@silentdoubt.edu",
            "password": "admin123"
        })
        assert res.status_code == 200, f"Admin login failed: {res.text}"
        admin_data = res.json()
        admin_token = admin_data["access_token"]
        assert admin_data["user"]["role"] == "admin"
        print("[PASS] 2. Admin login successful")

        # 3. Login as Faculty
        res = await client.post("/api/auth/login", json={
            "email": "faculty@silentdoubt.edu",
            "password": "faculty123"
        })
        assert res.status_code == 200, f"Faculty login failed: {res.text}"
        faculty_data = res.json()
        faculty_token = faculty_data["access_token"]
        faculty_id = faculty_data["user"]["id"]
        assert faculty_data["user"]["role"] == "faculty"
        print("[PASS] 3. Faculty login successful")

        # 4. Login as Student (Alex)
        res = await client.post("/api/auth/login", json={
            "email": "alex@silentdoubt.edu",
            "password": "student123"
        })
        assert res.status_code == 200, f"Student login failed: {res.text}"
        alex_data = res.json()
        alex_token = alex_data["access_token"]
        alex_id = alex_data["user"]["id"]
        print("[PASS] 4. Student (Alex) login successful")

        # 5. Faculty gets timetable
        res = await client.get("/api/timetable/me", headers={"Authorization": f"Bearer {faculty_token}"})
        assert res.status_code == 200
        entries = res.json()
        assert len(entries) > 0, "No timetable entries found for faculty"
        first_entry = entries[0]
        print(f"[PASS] 5. Faculty timetable fetched: '{first_entry['subject']}' for section '{first_entry['section']}'")

        # 6. Faculty starts a session
        res = await client.post(
            "/api/sessions/start",
            json={"timetable_entry_id": first_entry["id"]},
            headers={"Authorization": f"Bearer {faculty_token}"}
        )
        assert res.status_code in [200, 201], f"Start session failed: {res.text}"
        session_data = res.json()
        session_id = session_data["id"]
        assert session_data["status"] == "active"
        print(f"[PASS] 6. Faculty started live session #{session_id}")

        # 7. Student checks notifications
        res = await client.get("/api/notifications/me", headers={"Authorization": f"Bearer {alex_token}"})
        assert res.status_code == 200
        notifs = res.json()
        assert len(notifs) > 0
        print(f"[PASS] 7. Student received notification: '{notifs[0]['message']}'")

        # 8. Student checks active session
        res = await client.get("/api/sessions/active", headers={"Authorization": f"Bearer {alex_token}"})
        assert res.status_code == 200
        active_sess = res.json()
        assert active_sess is not None and active_sess["id"] == session_id
        print(f"[PASS] 8. Student found active session #{active_sess['id']}")

        # 9. Real-Time WebSockets Test
        faculty_ws_url = f"{WS_URL}/ws/session/{session_id}?token={faculty_token}"
        alex_ws_url = f"{WS_URL}/ws/session/{session_id}?token={alex_token}"

        print("[INFO] Connecting Faculty and Student to WebSockets...")
        async with websockets.connect(faculty_ws_url) as faculty_ws, \
                   websockets.connect(alex_ws_url) as alex_ws:
            
            # Faculty and Student receive student attendance update
            raw_att_f = await asyncio.wait_for(faculty_ws.recv(), timeout=5.0)
            att_event_f = json.loads(raw_att_f)
            assert att_event_f["type"] == "attendance.update"
            assert att_event_f["student_id"] == alex_id
            print(f"[PASS] 9. Faculty received live attendance broadcast: Student {att_event_f['student_name']} joined")

            raw_att_s = await asyncio.wait_for(alex_ws.recv(), timeout=5.0)
            att_event_s = json.loads(raw_att_s)
            assert att_event_s["type"] == "attendance.update"

            # Student submits an anonymous doubt
            doubt_text = "What is the difference between a mutex and a binary semaphore?"
            await alex_ws.send(json.dumps({
                "type": "doubt.submit",
                "text": doubt_text,
                "is_anonymous": True
            }))

            # Faculty receives the doubt -> must be masked as Anonymous
            f_doubt_raw = await asyncio.wait_for(faculty_ws.recv(), timeout=5.0)
            f_doubt_event = json.loads(f_doubt_raw)
            assert f_doubt_event["type"] == "doubt.new"
            f_doubt = f_doubt_event["doubt"]
            assert f_doubt["student_id"] is None, "Anonymity violation: student_id leaked to faculty!"
            assert f_doubt["student_name"] == "Anonymous Student"
            assert f_doubt["text"] == doubt_text
            doubt_id = f_doubt["id"]
            print("[PASS] 10. Anonymous doubt received by faculty with student_id properly stripped")

            # Student receives own doubt -> has is_own=True
            s_doubt_raw = await asyncio.wait_for(alex_ws.recv(), timeout=5.0)
            s_doubt_event = json.loads(s_doubt_raw)
            assert s_doubt_event["type"] == "doubt.new"
            s_doubt = s_doubt_event["doubt"]
            assert s_doubt["is_own"] is True
            assert s_doubt["student_name"] == "You (Anonymous)"
            print("[PASS] 11. Student received own doubt with author acknowledgment")

            # Student upvotes the doubt
            await alex_ws.send(json.dumps({
                "type": "doubt.upvote",
                "doubt_id": doubt_id
            }))
            # Faculty gets updated doubt
            f_upvote_raw = await asyncio.wait_for(faculty_ws.recv(), timeout=5.0)
            f_upvote_event = json.loads(f_upvote_raw)
            assert f_upvote_event["doubt"]["upvote_count"] == 1
            # Student gets updated doubt
            s_upvote_raw = await asyncio.wait_for(alex_ws.recv(), timeout=5.0)
            s_upvote_event = json.loads(s_upvote_raw)
            assert s_upvote_event["doubt"]["upvote_count"] == 1
            print("[PASS] 12. Upvote registered and broadcasted (count=1)")

            # Student bumps the doubt
            await alex_ws.send(json.dumps({
                "type": "doubt.bump",
                "doubt_id": doubt_id
            }))
            f_bump_raw = await asyncio.wait_for(faculty_ws.recv(), timeout=5.0)
            f_bump_event = json.loads(f_bump_raw)
            assert f_bump_event["doubt"]["bumped_at"] is not None
            s_bump_raw = await asyncio.wait_for(alex_ws.recv(), timeout=5.0)
            print("[PASS] 13. Doubt re-raised/bumped successfully")

            # Faculty resolves the doubt
            await faculty_ws.send(json.dumps({
                "type": "doubt.resolve",
                "doubt_id": doubt_id
            }))
            f_res_raw = await asyncio.wait_for(faculty_ws.recv(), timeout=5.0)
            f_res_event = json.loads(f_res_raw)
            assert f_res_event["doubt"]["status"] == "resolved"
            s_res_raw = await asyncio.wait_for(alex_ws.recv(), timeout=5.0)
            s_res_event = json.loads(s_res_raw)
            assert s_res_event["doubt"]["status"] == "resolved"
            print("[PASS] 14. Doubt resolved by faculty")

            # Faculty creates a live poll
            poll_q = "Do you understand deadlock detection algorithms?"
            poll_opts = ["Yes, fully clear", "Somewhat", "Need more examples"]
            await faculty_ws.send(json.dumps({
                "type": "poll.create",
                "question": poll_q,
                "options": poll_opts
            }))

            # Faculty receives poll
            f_poll_raw = await asyncio.wait_for(faculty_ws.recv(), timeout=5.0)
            # Student receives poll
            s_poll_raw = await asyncio.wait_for(alex_ws.recv(), timeout=5.0)
            s_poll_event = json.loads(s_poll_raw)
            assert s_poll_event["type"] == "poll.new"
            poll_id = s_poll_event["poll"]["id"]
            print(f"[PASS] 15. Live poll #{poll_id} broadcasted to student and faculty")

            # Student votes on poll
            await alex_ws.send(json.dumps({
                "type": "poll.respond",
                "poll_id": poll_id,
                "option": "Yes, fully clear"
            }))

            # Faculty receives tally
            f_tally_raw = await asyncio.wait_for(faculty_ws.recv(), timeout=5.0)
            f_tally_event = json.loads(f_tally_raw)
            assert f_tally_event["type"] == "poll.result"
            assert f_tally_event["tally"]["Yes, fully clear"] == 1
            assert f_tally_event["percentages"]["Yes, fully clear"] == 100.0

            # Student receives tally
            s_tally_raw = await asyncio.wait_for(alex_ws.recv(), timeout=5.0)
            s_tally_event = json.loads(s_tally_raw)
            assert s_tally_event["percentages"]["Yes, fully clear"] == 100.0
            print("[PASS] 16. Poll vote recorded with accurate real-time percentage tally")

            # Faculty closes poll
            await faculty_ws.send(json.dumps({
                "type": "poll.close",
                "poll_id": poll_id
            }))
            f_close_raw = await asyncio.wait_for(faculty_ws.recv(), timeout=5.0)
            f_close_event = json.loads(f_close_raw)
            assert f_close_event["status"] == "closed"
            s_close_raw = await asyncio.wait_for(alex_ws.recv(), timeout=5.0)
            print("[PASS] 17. Poll closed by faculty")

            # 10. Faculty ends session via REST
            res = await client.post(f"/api/sessions/{session_id}/end", headers={"Authorization": f"Bearer {faculty_token}"})
            assert res.status_code == 200
            
            # Faculty & Student receive session.ended over WS
            f_end_raw = await asyncio.wait_for(faculty_ws.recv(), timeout=5.0)
            s_end_raw = await asyncio.wait_for(alex_ws.recv(), timeout=5.0)
            s_end_event = json.loads(s_end_raw)
            assert s_end_event["type"] == "session.ended"
            print("[PASS] 18. Session ended and broadcasted to all connected clients")

    print("\n============================================================")
    print(" ALL 18 BACKEND & WEBSOCKET E2E TESTS PASSED WITH 100% SUCCESS!")
    print("============================================================\n")

if __name__ == "__main__":
    asyncio.run(run_tests())
