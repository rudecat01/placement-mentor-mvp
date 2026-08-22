"""Placement Mentor 2.0 - Concurrent 1-Command Startup Launcher.

Launches:
1. FastAPI Backend on http://localhost:4000 (Swagger Docs: http://localhost:4000/docs)
2. Next.js 15 Frontend on http://localhost:3000
"""

import os
import subprocess
import sys
import time


def main():
    print("=" * 65)
    print("  Starting Placement Mentor 2.0 (Backend & Frontend)  ")
    print("=" * 65)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    client_dir = os.path.join(base_dir, "client")

    is_win = sys.platform == "win32"

    # 1. Start FastAPI Backend on port 4000
    print("[1/2] Launching FastAPI Backend on http://localhost:4000 ...")
    backend_cmd = [
        sys.executable, "-m", "uvicorn", "server.main:app",
        "--host", "0.0.0.0", "--port", "4000", "--reload"
    ]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=base_dir,
        shell=is_win
    )

    time.sleep(2.0)

    # 2. Start Next.js Frontend Dev Server on port 3000
    print("[2/2] Launching Next.js Frontend on http://localhost:3000 ...")
    if is_win:
        frontend_proc = subprocess.Popen(
            "npm.cmd run dev",
            cwd=client_dir,
            shell=True
        )
    else:
        frontend_proc = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=client_dir
        )

    print("\n" + "=" * 65)
    print("  All Services Active:")
    print("  Web App:  http://localhost:3000")
    print("  API Docs: http://localhost:4000/docs")
    print("=" * 65)
    print("Press Ctrl+C in this terminal to stop all services.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done.")


if __name__ == "__main__":
    main()
