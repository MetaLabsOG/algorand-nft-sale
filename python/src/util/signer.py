import logging

import Crypto.Hash.MD5 as MD5
import Crypto.PublicKey.RSA as RSA
import os

from Crypto.Signature import pkcs1_15

from python.src.env import PRIVATE_KEY_FILE, PUBLIC_KEY_FILE

key = RSA.importKey(open(PRIVATE_KEY_FILE).read())

logger = logging.getLogger(__name__)


def gen_key(private_filename: str, public_filename: str):
    new_key = RSA.generate(2048, os.urandom)
    private_key = new_key.exportKey(format='PEM')
    with open(private_filename, 'wb') as f:
        f.write(private_key)

    public_key = new_key.publickey().exportKey(format='PEM')
    with open(public_filename, 'wb') as f:
        f.write(public_key)

    return new_key


def sign(filename: str, out_filename: str):
    with open(filename, 'rb') as f:
        data = f.read()
        h = MD5.new(data)
        signature = pkcs1_15.new(key).sign(h)
        logger.info(f'{filename} sig is {signature.hex()}')

        with open(out_filename, 'wb') as out_f:
            out_f.write(signature)
            logger.info(f'Written to {out_filename}')


def verify(filename: str, sig_filename: str) -> None:
    with open(filename, 'rb') as f:
        with open(sig_filename, 'rb') as sig_f:
            data = f.read()
            h = MD5.new(data)
            signature = sig_f.read()
            logger.info(f'{filename} sig is {signature.hex()}')
            pkcs1_15.new(key).verify(h, signature)


if __name__ == '__main__':
    gen_key(PRIVATE_KEY_FILE, PUBLIC_KEY_FILE)
