"""Extract only Samsung's public Partner CA from its official SDK extension."""

import io
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

index = ET.fromstring(
    urllib.request.urlopen(
        "https://download.tizen.org/sdk/tizenstudio/official/extension_info.xml", timeout=30
    ).read()
)
url = next(
    e.findtext("repository").strip()
    for e in index.findall(".//extension")
    if e.findtext("name") == "Samsung Certificate Extension"
)
data = urllib.request.urlopen(url, timeout=60).read()


def find_ca(data):
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        for name in archive.namelist():
            if name.endswith("vd_tizen_dev_partner2.crt"):
                return archive.read(name)
        for name in archive.namelist():
            if name.endswith((".zip", ".jar")):
                result = find_ca(archive.read(name))
                if result:
                    return result


result = find_ca(data)
if not result:
    raise SystemExit("Partner CA not found in the official Samsung extension.")
folder = Path(__file__).parent / "certificates"
folder.mkdir(exist_ok=True)
(folder / "vd_tizen_dev_partner2.crt").write_bytes(result)
print("Samsung Partner CA extracted from official SDK extension.")
