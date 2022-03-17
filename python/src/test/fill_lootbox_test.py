import concurrent.futures
import requests
import time


requests_cnt = 17
url = 'https://app.metapunks.world/api/fill_lootbox'
app_id = 52665809
amount = 1
buyer_address = 'test_2'


CONNECTIONS = 100
TIMEOUT = 5


def load_url():
    payload = {'app_id': app_id, 'amount': amount, 'buyer_address': buyer_address}
    print(requests.post(url, params=payload))


def test():
    with concurrent.futures.ThreadPoolExecutor(max_workers=requests_cnt) as executor:
        future_to_url = (executor.submit(load_url) for i in range(0, requests_cnt))
        time1 = time.time()
        for future in concurrent.futures.as_completed(future_to_url):
            try:
                future.result()
            except Exception as exc:
                print(str(type(exc)))

        time2 = time.time()

    print(f'Took {time2 - time1:.2f} s')


if __name__ == '__main__':
    test()

