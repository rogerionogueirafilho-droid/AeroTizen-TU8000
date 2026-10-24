"""Ask Samsung for a TV-bound Partner distributor cert; retain the existing author."""

import argparse
import shutil
from pathlib import Path

from cryptography import x509
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import pkcs12
from cryptography.x509.oid import NameOID

from aerotizen import certs
from aerotizen.cli import cert_dir_for
from aerotizen.sdb import Sdb

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--tv", required=True, help="TV IP address")
args = parser.parse_args()
with Sdb(args.tv) as tv:
    duid = tv.duid()
folder = Path(cert_dir_for(duid))
password = (folder / "password.txt").read_text().encode()
key, author, _chain = pkcs12.load_key_and_certificates((folder / "author.p12").read_bytes(), password)
backup = folder / "public-backup"
backup.mkdir(exist_ok=True)
for name in ("author.p12", "distributor.p12", "password.txt", "device-profile.xml"):
    if not (backup / name).exists():
        shutil.copy2(folder / name, backup / name)

auth = certs.samsung_login()
email = auth.get("inputEmailID") or ""
csr = certs._csr(
    key,
    x509.Name(
        [
            x509.NameAttribute(NameOID.COMMON_NAME, "TizenSDK"),
            x509.NameAttribute(NameOID.EMAIL_ADDRESS, email),
        ]
    ),
    ["URN:tizen:packageid=", "URN:tizen:deviceid=" + duid],
)
fields = {
    "access_token": auth["access_token"],
    "user_id": auth["userId"],
    "platform": "VD",
    "privilege_level": "Partner",
    "developer_type": "Individual",
}
profile = certs._post(certs.DIST_V1_URL, fields, "distributor.csr", csr)
distributor = certs._load_cert(certs._post(certs.DIST_V3_URL, fields, "distributor.csr", csr))
ca = certs._load_cert((Path(__file__).parent / "certificates" / "vd_tizen_dev_partner2.crt").read_bytes())
distributor.verify_directly_issued_by(ca)
result = pkcs12.serialize_key_and_certificates(
    b"distributor", key, distributor, [ca], serialization.BestAvailableEncryption(password)
)
(folder / "distributor.p12").write_bytes(result)
(folder / "device-profile.xml").write_bytes(profile)
print("Samsung issued the requested Partner distributor certificate. Original author preserved.", flush=True)
