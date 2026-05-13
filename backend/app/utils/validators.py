import re

PHONE_RE = re.compile(r"^\+?[\d\s\-(). ]{10,}$")


def is_valid_phone(value: str) -> bool:
    return bool(PHONE_RE.match(value.strip()))
