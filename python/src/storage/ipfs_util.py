import ipfshttpclient

BASE_URL = "https://ipfs.io/ipfs/"

client = ipfshttpclient.connect()


def upload(filename: str) -> str:
    res = client.add(filename)
    file_hash = res['Hash']
    return f'{BASE_URL}{file_hash}'


# Test
if __name__ == '__main__':
    filename = ''
    print(upload(filename))
