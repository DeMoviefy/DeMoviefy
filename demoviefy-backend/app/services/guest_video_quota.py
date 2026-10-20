from flask import session

from app.repositories.video_repository import count_guest_videos

GUEST_UPLOADS_USED_KEY = "guest_uploads_used"


def guest_uploads_used(guest_token: str | None = None) -> int:
    """Return this browser session's cumulative guest uploads."""
    stored_count = session.get(GUEST_UPLOADS_USED_KEY, 0)
    if not isinstance(stored_count, int) or isinstance(stored_count, bool):
        stored_count = 0

    current_guest_count = count_guest_videos(guest_token) if guest_token else 0
    return max(0, stored_count) + current_guest_count
