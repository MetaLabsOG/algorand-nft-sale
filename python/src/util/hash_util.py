import base64
import hashlib
import json


def get_hash(file_path: str) -> bytes:
    with open(file_path, "rb") as f:
        file_bytes = f.read()
        file_hash = hashlib.sha256(file_bytes).digest()
        return file_hash


def get_hash_base64(file_path: str) -> str:
    file_hash = get_hash(file_path)
    return str(base64.b64encode(file_hash))


def get_json_hash(json_path: str) -> bytes:
    with open(json_path, "rb") as f:
        JSON = json.loads(f.read())
        json_str = json.dumps(JSON)

        json_hash = hashlib.new('sha512_256')
        json_hash.update(b"arc0003/amj")
        json_hash.update(json_str.encode('utf-8'))
        return json_hash.digest()
