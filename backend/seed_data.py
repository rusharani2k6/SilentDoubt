import os
import sys

# Add backend root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import User, TimetableEntry, Session, Doubt, DoubtUpvote, Poll, PollResponse, Attendance, Notification
from app.auth_utils import get_password_hash
from datetime import datetime, timezone

def seed():
    print("[INFO] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_admin = db.query(User).filter(User.email == "admin@silentdoubt.edu").first()
        if existing_admin:
            print("[INFO] Database already contains seed data.")
            return

        print("[INFO] Creating users...")
        # 1. Admin
        admin = User(
            name="System Administrator",
            email="admin@silentdoubt.edu",
            password_hash=get_password_hash("admin123"),
            role="admin",
            section=None,
            is_active=True
        )
        db.add(admin)

        # 2. Faculty
        faculty = User(
            name="Dr. Sarah Smith",
            email="faculty@silentdoubt.edu",
            password_hash=get_password_hash("faculty123"),
            role="faculty",
            section=None,
            is_active=True
        )
        db.add(faculty)
        db.commit()
        db.refresh(faculty)

        # 3. Students
        student1 = User(
            name="Alex Rivera",
            email="alex@silentdoubt.edu",
            password_hash=get_password_hash("student123"),
            role="student",
            section="2-CSM-F",
            is_active=True
        )
        student2 = User(
            name="Priya Sharma",
            email="priya@silentdoubt.edu",
            password_hash=get_password_hash("student123"),
            role="student",
            section="2-CSM-F",
            is_active=True
        )
        db.add(student1)
        db.add(student2)
        db.commit()

        print("[INFO] Creating timetable entries...")
        # 4. Timetable Entries
        tt1 = TimetableEntry(
            faculty_id=faculty.id,
            section="2-CSM-F",
            subject="Operating Systems & Concurrency",
            day_of_week="Monday",
            start_time="09:00",
            end_time="10:00"
        )
        tt2 = TimetableEntry(
            faculty_id=faculty.id,
            section="2-CSM-F",
            subject="Cloud Computing & Distributed Systems",
            day_of_week="Wednesday",
            start_time="11:00",
            end_time="12:00"
        )
        tt3 = TimetableEntry(
            faculty_id=faculty.id,
            section="2-CSM-F",
            subject="Advanced Database Management",
            day_of_week="Friday",
            start_time="14:00",
            end_time="15:00"
        )
        db.add_all([tt1, tt2, tt3])
        db.commit()
        db.refresh(tt1)

        # 5. One completed demo session for the Admin Doubt Monitor
        now = datetime.now(timezone.utc)
        demo_session = Session(
            timetable_entry_id=tt1.id,
            faculty_id=faculty.id,
            status="ended",
            started_at=now.replace(minute=max(0, now.minute - 45)),
            ended_at=now.replace(minute=max(0, now.minute - 5)),
        )
        db.add(demo_session)
        db.commit()
        db.refresh(demo_session)

        demo_doubt_1 = Doubt(
            session_id=demo_session.id,
            student_id=student1.id,
            text="Can you explain the difference between a process and a thread?",
            is_anonymous=True,
            status="open",
            moderation_status="normal",
            upvote_count=2,
            created_at=demo_session.started_at,
        )
        demo_doubt_2 = Doubt(
            session_id=demo_session.id,
            student_id=student2.id,
            text="Why is context switching expensive?",
            is_anonymous=False,
            status="resolved",
            moderation_status="normal",
            upvote_count=1,
            created_at=now.replace(minute=max(0, now.minute - 30)),
        )
        db.add_all([demo_doubt_1, demo_doubt_2])
        db.commit()

        print("[SUCCESS] Database seeding completed successfully!")
        print("\nDefault Accounts:")
        print("----------------------------------------------------------------")
        print("Admin:   admin@silentdoubt.edu   / admin123")
        print("Faculty: faculty@silentdoubt.edu / faculty123 (Dr. Sarah Smith)")
        print("Student: alex@silentdoubt.edu    / student123 (Alex Rivera, 2-CSM-F)")
        print("Student: priya@silentdoubt.edu   / student123 (Priya Sharma, 2-CSM-F)")
        print("----------------------------------------------------------------\n")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
