# Testing DeMoviefy

Open the simple test menu from the repository root:

```powershell
.\test.ps1
```

Choose one of the following:

1. Run all functional and security scenarios (CT01-CT14 and SEC01-SEC05).
2. Run one scenario, such as CT03.
3. Run all scenarios and build the frontend.

For non-interactive use, run all tests directly:

```powershell
.\test.ps1 -All
```

Run one scenario directly:

```powershell
.\test.ps1 -Test CT03
```

To also verify that the frontend builds successfully:

```powershell
.\test.ps1 -Frontend
```

The script uses the project's `.venv` and runs the acceptance scenarios in
`demoviefy-backend/tests/test_test_plan.py`. To run every backend test module,
including registration, session, and artifact-cleanup tests:

```powershell
Push-Location .\demoviefy-backend
..\.venv\Scripts\python.exe -m unittest discover -s tests -v
Pop-Location
```

## What is covered

`test_test_plan.py` implements the scenarios from the official test plan:

| ID | Automated check |
| --- | --- |
| CT01 | A supported video upload is saved and queued. |
| CT02 | Unsupported file types are rejected before processing. |
| CT03 | A completed transcription is returned to the client. |
| CT04 | Low-quality audio results do not break the transcription flow. |
| CT05 | Sensitive-content labels and critical timestamps are returned. |
| CT06 | Partial analysis and transcription results return `202` while processing. |
| CT07 | Manual transcription updates are allowed; AI analysis updates are rejected. |
| CT08 | Multiple uploads are accepted and each one is queued. |
| CT09 | Duplicate filenames are stored in separate files. |
| CT10 | Video deletion cleans its associated artifacts and database record. |
| CT11 | A failed artifact cleanup preserves the video database record. |
| CT12 | Video visibility is limited to its owner and configured administrators. |
| CT13 | Guest upload limits and per-session video isolation are enforced. |
| CT14 | Guest videos and artifacts are removed when the backend restarts. |

Security scenarios are also available individually:

| ID | Automated check |
| --- | --- |
| SEC01 | Traversal-style filenames are sanitized and stay inside storage. |
| SEC02 | Invalid frame, confidence, and clip parameters are rejected. |
| SEC03 | Unknown video statuses are rejected without changing state. |
| SEC04 | Unknown video IDs do not expose resources. |
| SEC05 | Private guest video sessions are isolated. |

An additional regression check verifies that the session cookie continues to
authorize transcription generation and editing, video reprocessing, and video
deletion after an authenticated upload.

## Important scope note

These are fast, repeatable acceptance tests. They use temporary files and a
temporary SQLite database, and simulate AI artifacts instead of downloading or
running Whisper/YOLO models.

The full infrastructure part of CT08 still needs a separate load test against
the deployed Nginx + Flask environment, because Nginx is outside the Flask test
process.
Optional security checks for a development environment:

```powershell
python -m pip install bandit pip-audit ruff
bandit -r demoviefy-backend/app
pip-audit -r demoviefy-backend/requirements.txt
ruff check demoviefy-backend
```
