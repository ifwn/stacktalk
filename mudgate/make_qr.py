#!/usr/bin/env python
"""
Generate a QR code for the Keycloak QR-bridge confirm endpoint.

Usage:
    python make_qr.py <session_id>

Requires:
    pip install qrcode[pil]
"""

import sys, qrcode, pathlib
# pip install qrcode[pil]

BASE_URL = "https://cloaking.bernard-labs.com/qr-login/confirm/"

def main():
    if len(sys.argv) != 2:
        sys.exit("Usage: python make_qr.py <session_id>")

    sid = sys.argv[1]
    url = f"{BASE_URL}{sid}"
    out = pathlib.Path("qr.png")

    img = qrcode.make(url)              # default 290×290 PNG
    img.save(out)

    print(f"✅  QR saved to {out.resolve()}")
    print(f"    (encodes: {url})")

if __name__ == "__main__":
    main()
