# ============================================================================
# daily_job.py — APScheduler Daily Recompute Job
# Owner: Member 2 (AI/Data Lead)
# When to build: Day 3
# ============================================================================
#
# PURPOSE:
#   Schedule a daily job that runs the full risk pipeline automatically.
#   In production, this would run once per day (e.g., 6:00 AM UTC).
#   For demo purposes, we also expose manual trigger via /internal/recompute.
#
# WHAT TO BUILD:
#
#   1. Create a BackgroundScheduler instance from APScheduler
#
#   2. A function `start_scheduler()` that:
#      - Creates the scheduler
#      - Adds a CronTrigger job that runs at SCHEDULER_HOUR:SCHEDULER_MINUTE
#      - The job function calls risk_fusion.run_full_pipeline()
#      - Starts the scheduler
#      - This is called from app/main.py lifespan startup
#
#   3. A function `shutdown_scheduler()` that:
#      - Cleanly shuts down the scheduler
#      - This is called from app/main.py lifespan shutdown
#
#   4. A function `daily_recompute_job()` that:
#      - This is the actual function the scheduler runs
#      - Wraps risk_fusion.run_full_pipeline() in a try/except
#      - Logs success/failure with timestamp
#      - NOTE: APScheduler runs in a background thread, not an async context,
#        so you may need to use asyncio.run() or the sync version of pymongo
#
# EXAMPLE:
#   from apscheduler.schedulers.background import BackgroundScheduler
#   from apscheduler.triggers.cron import CronTrigger
#
#   scheduler = BackgroundScheduler()
#   scheduler.add_job(
#       daily_recompute_job,
#       CronTrigger(hour=settings.SCHEDULER_HOUR, minute=settings.SCHEDULER_MINUTE),
#       id="daily_risk_recompute",
#       replace_existing=True
#   )
#   scheduler.start()
#
# DEPENDENCIES:
#   - apscheduler (BackgroundScheduler, CronTrigger)
#   - app.config.settings (for schedule time)
#   - app.services.risk_fusion (for the actual pipeline)
#
# CONNECTS TO:
#   - Started/stopped by app/main.py lifespan events (already wired)
#   - Calls risk_fusion.run_full_pipeline()
#
# ============================================================================
