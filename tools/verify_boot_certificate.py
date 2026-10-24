"""Verify Samsung Partner issuance and assemble its matching distributor CA chain."""

import argparse
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import pkcs12

from aerotizen import certs
from aerotizen.cli import cert_dir_for
from aerotizen.sdb import Sdb

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--tv", required=True, help="TV IP address")
args = parser.parse_args()
with Sdb(args.tv) as tv:
    folder = Path(cert_dir_for(tv.duid()))
password = (folder / "password.txt").read_text().encode()
key, certificate, _chain = pkcs12.load_key_and_certificates(
    (folder / "distributor.p12").read_bytes(), password
)
ca = certs._load_cert((Path(__file__).parent / "certificates" / "vd_tizen_dev_partner2.crt").read_bytes())
certificate.verify_directly_issued_by(ca)
assert (folder / "author.p12").read_bytes() == (folder / "public-backup" / "author.p12").read_bytes()
(folder / "distributor.p12").write_bytes(
    pkcs12.serialize_key_and_certificates(
        b"distributor", key, certificate, [ca], serialization.BestAvailableEncryption(password)
    )
)
print(
    "Partner certificate signature verified against official Samsung Partner CA; original author unchanged."
)
