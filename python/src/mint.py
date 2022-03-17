import json
import sys
from typing import List

from blockchain.nft import create_nft
from env import IMAGES_DIR, MODELS_DIR, ATTRS_DIR, IMAGE_EXT, MODEL_EXT, IMAGE_MIMETYPE, MODEL_MIMETYPE
from storage.arweave_util import upload_file


def mint_nft(num: int, image_path: str, model_path: str, metadata_path: str) -> str:
    image_url = upload_file(image_path, IMAGE_MIMETYPE)
    model_url = upload_file(model_path, MODEL_MIMETYPE)
    attr_file = open(metadata_path)
    attrs_json = json.load(attr_file)
    return create_nft(num, image_url, model_url, attrs_json)


def mint_nfts(first_id: int, count: int) -> List[str]:
    print(f'Minting {count} NFTs starting with id={first_id}')
    asa_ids = []
    for i in range(first_id, first_id + count):
        image_path = f'{IMAGES_DIR}/{i}.{IMAGE_EXT}'
        model_path = f'{MODELS_DIR}/{i}.{MODEL_EXT}'
        attrs_path = f'{ATTRS_DIR}/{i}.json'
        asa_id = None
        while asa_id is None:
            try:
                asa_id = mint_nft(i, image_path, model_path, attrs_path)
            except KeyboardInterrupt:
                exit(0)
            except Exception as e:
                print("=====ERROR=====")
                print(e)
                print("===============")
        asa_ids.append(asa_id)

    return asa_ids


if __name__ == "__main__":
    first_id = int(sys.argv[1])
    count = 1 if len(sys.argv) == 2 else int(sys.argv[2])
    asa_ids = mint_nfts(first_id, count)
    print(f'ASA ids: {asa_ids}')
