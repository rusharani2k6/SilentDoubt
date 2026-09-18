import { useState, useEffect, useRef, useCallback } from 'react';
import { getSessionSnapshotApi } from '../api/sessions';

export const useSessionSocket = (
  sessionId,
  token,
  initialSnapshot = null
) => {
  const [connected, setConnected] = useState(false);

  const [sessionData, setSessionData] = useState(
    initialSnapshot?.session || null
  );

  const [doubts, setDoubts] = useState(
    initialSnapshot?.doubts || []
  );

  const [polls, setPolls] = useState(
    initialSnapshot?.polls || []
  );

  // ============================================================
  // ATTENDANCE
  // ============================================================

  const [attendance, setAttendance] = useState(
    initialSnapshot?.attendance || []
  );

  const [attendanceCount, setAttendanceCount] = useState(
    initialSnapshot?.attendance_count || 0
  );

  const [sessionEnded, setSessionEnded] = useState(false);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // ============================================================
  // LOAD INITIAL SESSION SNAPSHOT
  // ============================================================

  const loadSnapshot = useCallback(async () => {
    if (!sessionId) return;

    try {
      const data = await getSessionSnapshotApi(sessionId);

      setSessionData(data.session || null);
      setDoubts(data.doubts || []);
      setPolls(data.polls || []);

      const attendanceRecords = (data.attendance || []).map(
        (att) => ({
          ...att,

          student_id:
            att.student_id !== undefined
              ? Number(att.student_id)
              : att.student_id,

          roll_number:
            att.roll_number !== undefined
              ? att.roll_number
              : null,
        })
      );

      setAttendance(attendanceRecords);

      setAttendanceCount(
        data.attendance_count || attendanceRecords.length
      );

      if (data.session?.status === 'ended') {
        setSessionEnded(true);
      }
    } catch (err) {
      console.error(
        'Failed to load session snapshot:',
        err
      );

      setError(
        'Failed to load session details.'
      );
    }
  }, [sessionId]);

  useEffect(() => {
    loadSnapshot();
  }, [loadSnapshot]);

  // ============================================================
  // WEBSOCKET CONNECTION
  // ============================================================

  useEffect(() => {
    if (!sessionId || !token) return;

    let isMounted = true;

    const connectWebSocket = () => {
      if (!isMounted) return;

      // ========================================================
      // PRODUCTION / LOCAL WEBSOCKET URL
      // ========================================================

      const wsProtocol =
        window.location.protocol === 'https:'
          ? 'wss:'
          : 'ws:';

      const wsBaseUrl =
        import.meta.env.VITE_WS_URL ||
        `${wsProtocol}//${window.location.host}`;

      const wsUrl =
        `${wsBaseUrl}/ws/session/${sessionId}?token=${token}`;

      console.log(
        'Connecting WebSocket:',
        wsUrl
      );

      const ws = new WebSocket(wsUrl);

      socketRef.current = ws;

      // ========================================================
      // SOCKET OPEN
      // ========================================================

      ws.onopen = () => {
        if (!isMounted) return;

        console.log(
          'WebSocket connected'
        );

        setConnected(true);
        setError(null);

        ws.send(
          JSON.stringify({
            type: 'join',
          })
        );
      };

      // ========================================================
      // SOCKET MESSAGE
      // ========================================================

      ws.onmessage = (event) => {
        if (!isMounted) return;

        try {
          const msg = JSON.parse(
            event.data
          );

          console.log(
            'WebSocket message:',
            msg
          );

          switch (msg.type) {

            // ==================================================
            // JOIN ACK
            // ==================================================

            case 'joined.ack':

              if (
                msg.attendance_count !==
                undefined
              ) {
                setAttendanceCount(
                  Number(msg.attendance_count)
                );
              }

              break;

            // ==================================================
            // ATTENDANCE UPDATE
            // ==================================================

            case 'attendance.update': {

              if (
                msg.attendance_count !==
                undefined
              ) {
                setAttendanceCount(
                  Number(msg.attendance_count)
                );
              }

              if (
                msg.student_id !== undefined &&
                msg.student_id !== null
              ) {

                setAttendance((prev) => {

                  const studentId =
                    Number(msg.student_id);

                  const existingIndex =
                    prev.findIndex(
                      (att) =>
                        Number(att.student_id) ===
                        studentId
                    );

                  // Existing attendance record
                  if (existingIndex !== -1) {

                    const updated = [
                      ...prev,
                    ];

                    updated[existingIndex] = {
                      ...updated[existingIndex],

                      student_id:
                        studentId,

                      student_name:
                        msg.student_name ||
                        updated[existingIndex]
                          .student_name ||
                        'Student',

                      roll_number:
                        msg.roll_number ??
                        updated[existingIndex]
                          .roll_number ??
                        null,

                      joined_at:
                        msg.joined_at ||
                        updated[existingIndex]
                          .joined_at,
                    };

                    return updated;
                  }

                  // New attendance record
                  return [
                    ...prev,
                    {
                      id:
                        msg.attendance_id ||
                        Date.now(),

                      session_id:
                        sessionId,

                      student_id:
                        studentId,

                      student_name:
                        msg.student_name ||
                        'Student',

                      roll_number:
                        msg.roll_number ??
                        null,

                      joined_at:
                        msg.joined_at ||
                        new Date().toISOString(),
                    },
                  ];
                });
              }

              break;
            }

            // ==================================================
            // NEW DOUBT
            // ==================================================

            case 'doubt.new':

              if (!msg.doubt) {
                break;
              }

              setDoubts((prev) => {

                if (
                  prev.some(
                    (d) =>
                      d.id ===
                      msg.doubt.id
                  )
                ) {
                  return prev;
                }

                return [
                  msg.doubt,
                  ...prev,
                ];
              });

              break;

            // ==================================================
            // DOUBT UPDATED
            // ==================================================

            case 'doubt.updated':

              if (!msg.doubt) {
                break;
              }

              setDoubts((prev) =>
                prev.map((d) =>
                  d.id ===
                  msg.doubt.id
                    ? {
                        ...d,
                        ...msg.doubt,
                      }
                    : d
                )
              );

              break;

            // ==================================================
            // FACULTY ANSWER
            // ==================================================

            case 'doubt.answered':

              if (!msg.doubt) {
                break;
              }

              setDoubts((prev) =>
                prev.map((d) =>
                  d.id ===
                  msg.doubt.id
                    ? {
                        ...d,
                        ...msg.doubt,
                      }
                    : d
                )
              );

              break;

            // ==================================================
            // NEW POLL
            // ==================================================

            case 'poll.new':

              if (!msg.poll) {
                break;
              }

              setPolls((prev) => {

                if (
                  prev.some(
                    (p) =>
                      p.id ===
                      msg.poll.id
                  )
                ) {
                  return prev;
                }

                return [
                  ...prev,
                  msg.poll,
                ];
              });

              break;

            // ==================================================
            // POLL RESULT
            // ==================================================

            case 'poll.result':

              setPolls((prev) =>
                prev.map((p) =>
                  p.id === msg.poll_id
                    ? {
                        ...p,

                        status:
                          msg.status ||
                          p.status,

                        tally:
                          msg.tally ||
                          p.tally,

                        percentages:
                          msg.percentages ||
                          p.percentages,

                        total_votes:
                          msg.total_votes !==
                          undefined
                            ? msg.total_votes
                            : p.total_votes,
                      }
                    : p
                )
              );

              break;

            // ==================================================
            // SESSION ENDED
            // ==================================================

            case 'session.ended':

              setSessionEnded(true);

              setSessionData((prev) =>
                prev
                  ? {
                      ...prev,
                      status: 'ended',
                    }
                  : prev
              );

              break;

            // ==================================================
            // ERROR
            // ==================================================

            case 'error':

              console.error(
                'WebSocket server error:',
                msg
              );

              setError(
                msg.message ||
                msg.detail ||
                'Something went wrong.'
              );

              break;

            // ==================================================
            // DEFAULT
            // ==================================================

            default:

              console.log(
                'Unknown WebSocket message:',
                msg.type
              );

              break;
          }

        } catch (e) {

          console.error(
            'Error handling WebSocket message:',
            e
          );
        }
      };

      // ========================================================
      // SOCKET CLOSE
      // ========================================================

      ws.onclose = (event) => {

        if (!isMounted) return;

        console.log(
          'WebSocket closed:',
          event.code,
          event.reason
        );

        setConnected(false);

        if (
          event.code !== 1000 &&
          event.code !== 1008 &&
          !sessionEnded
        ) {

          reconnectTimeoutRef.current =
            setTimeout(
              connectWebSocket,
              3000
            );
        }
      };

      // ========================================================
      // SOCKET ERROR
      // ========================================================

      ws.onerror = (err) => {

        if (!isMounted) return;

        console.error(
          'WebSocket encountered an error:',
          err
        );
      };
    };

    connectWebSocket();

    // ============================================================
    // CLEANUP
    // ============================================================

    return () => {

      isMounted = false;

      if (
        reconnectTimeoutRef.current
      ) {
        clearTimeout(
          reconnectTimeoutRef.current
        );

        reconnectTimeoutRef.current =
          null;
      }

      if (socketRef.current) {

        socketRef.current.close(
          1000,
          'Component unmounted'
        );

        socketRef.current = null;
      }
    };

  }, [
    sessionId,
    token,
    sessionEnded,
  ]);

  // ============================================================
  // SUBMIT DOUBT
  // ============================================================

  const submitDoubt = useCallback(
    (text, isAnonymous = true) => {

      if (
        socketRef.current &&
        socketRef.current.readyState ===
        WebSocket.OPEN
      ) {

        socketRef.current.send(
          JSON.stringify({
            type: 'doubt.submit',
            text,
            is_anonymous:
              isAnonymous,
          })
        );
      }
    },
    []
  );

  // ============================================================
  // UPVOTE DOUBT
  // ============================================================

  const upvoteDoubt = useCallback(
    (doubtId) => {

      if (
        socketRef.current &&
        socketRef.current.readyState ===
        WebSocket.OPEN
      ) {

        setDoubts((prev) =>
          prev.map((d) =>
            d.id === doubtId
              ? {
                  ...d,

                  has_upvoted:
                    !d.has_upvoted,

                  upvote_count:
                    d.has_upvoted
                      ? Math.max(
                          0,
                          (d.upvote_count ||
                            0) - 1
                        )
                      : (d.upvote_count ||
                          0) + 1,
                }
              : d
          )
        );

        socketRef.current.send(
          JSON.stringify({
            type: 'doubt.upvote',
            doubt_id: doubtId,
          })
        );
      }
    },
    []
  );

  // ============================================================
  // RE-RAISE DOUBT
  // ============================================================

  const bumpDoubt = useCallback(
    (doubtId) => {

      if (
        socketRef.current &&
        socketRef.current.readyState ===
        WebSocket.OPEN
      ) {

        socketRef.current.send(
          JSON.stringify({
            type: 'doubt.bump',
            doubt_id: doubtId,
          })
        );
      }
    },
    []
  );

  // ============================================================
  // RESOLVE DOUBT
  // ============================================================

  const resolveDoubt = useCallback(
    (doubtId) => {

      if (
        socketRef.current &&
        socketRef.current.readyState ===
        WebSocket.OPEN
      ) {

        socketRef.current.send(
          JSON.stringify({
            type: 'doubt.resolve',
            doubt_id: doubtId,
          })
        );
      }
    },
    []
  );

  // ============================================================
  // ANSWER DOUBT
  // ============================================================

  const answerDoubt = useCallback(
    (doubtId, answer) => {

      const cleanAnswer =
        answer?.trim();

      if (!cleanAnswer) {
        return;
      }

      if (
        socketRef.current &&
        socketRef.current.readyState ===
        WebSocket.OPEN
      ) {

        socketRef.current.send(
          JSON.stringify({
            type: 'doubt.answer',
            doubt_id: doubtId,
            answer: cleanAnswer,
          })
        );

      } else {

        console.warn(
          'Cannot answer doubt: WebSocket is not connected.'
        );
      }
    },
    []
  );

  // ============================================================
  // CREATE POLL
  // ============================================================

  const createPoll = useCallback(
    (question, options) => {

      if (
        socketRef.current &&
        socketRef.current.readyState ===
        WebSocket.OPEN
      ) {

        socketRef.current.send(
          JSON.stringify({
            type: 'poll.create',
            question,
            options,
          })
        );
      }
    },
    []
  );

  // ============================================================
  // RESPOND TO POLL
  // ============================================================

  const respondPoll = useCallback(
    (pollId, option) => {

      if (
        socketRef.current &&
        socketRef.current.readyState ===
        WebSocket.OPEN
      ) {

        setPolls((prev) =>
          prev.map((p) =>
            p.id === pollId
              ? {
                  ...p,
                  user_selected_option:
                    option,
                }
              : p
          )
        );

        socketRef.current.send(
          JSON.stringify({
            type: 'poll.respond',
            poll_id: pollId,
            option,
          })
        );
      }
    },
    []
  );

  // ============================================================
  // CLOSE POLL
  // ============================================================

  const closePoll = useCallback(
    (pollId) => {

      if (
        socketRef.current &&
        socketRef.current.readyState ===
        WebSocket.OPEN
      ) {

        socketRef.current.send(
          JSON.stringify({
            type: 'poll.close',
            poll_id: pollId,
          })
        );
      }
    },
    []
  );

  // ============================================================
  // RETURN
  // ============================================================

  return {
    connected,

    sessionData,

    doubts,

    polls,

    attendance,

    attendanceCount,

    sessionEnded,

    error,

    // Doubts
    submitDoubt,
    upvoteDoubt,
    bumpDoubt,
    resolveDoubt,
    answerDoubt,

    // Polls
    createPoll,
    respondPoll,
    closePoll,
  };
};