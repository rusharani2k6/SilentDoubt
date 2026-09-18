import json
from typing import Dict, List, Any
from fastapi import WebSocket

class Connection:
    def __init__(self, websocket: WebSocket, user_id: int, user_name: str, role: str):
        self.websocket = websocket
        self.user_id = user_id
        self.user_name = user_name
        self.role = role

class ConnectionManager:
    def __init__(self):
        # Maps session_id -> list of Connection objects
        self.active_rooms: Dict[int, List[Connection]] = {}

    async def connect(self, session_id: int, websocket: WebSocket, user_id: int, user_name: str, role: str) -> Connection:
        await websocket.accept()
        conn = Connection(websocket=websocket, user_id=user_id, user_name=user_name, role=role)
        if session_id not in self.active_rooms:
            self.active_rooms[session_id] = []
        self.active_rooms[session_id].append(conn)
        return conn

    def disconnect(self, session_id: int, websocket: WebSocket):
        if session_id in self.active_rooms:
            self.active_rooms[session_id] = [
                c for c in self.active_rooms[session_id] if c.websocket != websocket
            ]
            if not self.active_rooms[session_id]:
                del self.active_rooms[session_id]

    def get_room_connections(self, session_id: int) -> List[Connection]:
        return self.active_rooms.get(session_id, [])

    async def broadcast_raw(self, session_id: int, message: dict):
        connections = self.get_room_connections(session_id)
        for conn in list(connections):
            try:
                await conn.websocket.send_json(message)
            except Exception:
                pass

    async def broadcast_attendance(self, session_id: int, data: dict):
        message = {
            "type": "attendance.update",
            **data
        }
        await self.broadcast_raw(session_id, message)

    async def broadcast_doubt(
        self,
        session_id: int,
        event_type: str,
        doubt_dict: dict,
        author_id: int,
        is_anonymous: bool
    ):
        """
        Broadcast doubt event with per-recipient anonymity filtering:
        - For the author student: keep author identification / mark is_own = True
        - For faculty and other students if is_anonymous: strip student_id and student_name, mark is_own = False
        """
        connections = self.get_room_connections(session_id)
        for conn in list(connections):
            try:
                payload_doubt = dict(doubt_dict)
                is_author = (conn.user_id == author_id)
                payload_doubt["is_own"] = is_author
                
                if is_anonymous:
                    if is_author:
                        payload_doubt["student_name"] = "You (Anonymous)"
                        payload_doubt["student_id"] = conn.user_id
                    else:
                        payload_doubt["student_name"] = "Anonymous Student"
                        payload_doubt["student_id"] = None
                
                message = {
                    "type": event_type,
                    "doubt": payload_doubt
                }
                await conn.websocket.send_json(message)
            except Exception:
                pass

    async def broadcast_poll_new(self, session_id: int, poll_dict: dict):
        message = {
            "type": "poll.new",
            "poll": poll_dict
        }
        await self.broadcast_raw(session_id, message)

    async def broadcast_poll_result(self, session_id: int, poll_id: int, status: str, tally: dict, percentages: dict, total_votes: int):
        message = {
            "type": "poll.result",
            "poll_id": poll_id,
            "status": status,
            "tally": tally,
            "percentages": percentages,
            "total_votes": total_votes
        }
        await self.broadcast_raw(session_id, message)

    async def broadcast_session_ended(self, session_id: int):
        message = {
            "type": "session.ended"
        }
        await self.broadcast_raw(session_id, message)

    async def send_personal_message(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_json(message)
        except Exception:
            pass

manager = ConnectionManager()
