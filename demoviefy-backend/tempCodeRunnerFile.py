from app import create_app
import logging
import sys

# Create the Flask application
app = create_app()

def setup_startup_logging(debug_mode: bool):
    """Configures the logging output for the terminal during startup."""
    # Configure the root logger to ensure all logs are captured
    logging.basicConfig(
        level=logging.DEBUG if debug_mode else logging.INFO,
        format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        stream=sys.stdout
    )

    # Explicitly configure the Werkzeug logger (responsible for HTTP access logs)
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.setLevel(logging.DEBUG if debug_mode else logging.INFO)

    # Ensure it propagates to the root logger
    werkzeug_logger.propagate = True

    # Also configure the Flask app logger explicitly
    app.logger.setLevel(logging.DEBUG if debug_mode else logging.INFO)


    if debug_mode:
        print("\n" + "="*60)
        print("DeMoviefy Backend - DEBUG MODE ENABLED")
        print("="*60)
        print("Detailed logs and the interactive debugger are active.")
        print("Changes to code will automatically reload the server.")
        print("="*60 + "\n")
    else:
        print("\n" + "="*60)
        print("DeMoviefy Backend - PRODUCTION MODE")
        print("="*60 + "\n")

if __name__ == "__main__":
    # Set debug mode
    DEBUG = True

    # Setup our custom startup logging
    setup_startup_logging(DEBUG)

    try:
        # Run the application
        app.run(debug=DEBUG)
    except Exception as e:
        logging.error(f"Fatal error during application startup: {e}")
        sys.exit(1)
