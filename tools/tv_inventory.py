"""Refresh the launcher's offline installed-app inventory from a Samsung TV."""

import argparse
import json
from pathlib import Path

from aerotizen.catalog import parse_applist
from aerotizen.sdb import Sdb

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--tv", required=True, help="TV IP address")
args = parser.parse_args()
root = Path(__file__).resolve().parents[1] / "launcher"
apps = []
with Sdb(args.tv) as tv:
    for app in parse_applist(tv.applist()):
        if app["pkgid"] == "DclHome001":
            continue
        entry = {"id": app["appid"], "name": app["name"], "storeId": app["store_id"], "icon": ""}
        apps.append(entry)
(root / "js" / "installed-apps.js").write_text(
    "// Installed-app fallback captured from this TV; runtime discovery refreshes this list.\n"
    + "window.INSTALLED_APPS = "
    + json.dumps(apps, ensure_ascii=False, indent=2)
    + ";\n",
    encoding="utf-8",
)
print("Saved", len(apps), "apps")
