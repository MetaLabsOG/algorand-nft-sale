import logging

from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

from .env import NO_LIMITS, PUBLIC_SALE, API_PASSWORD
from .nft_manager import nfts_left_count
from .whitelist_manager import get_limit, increase_limit, can_spend, spend, set_limit
from .lootbox import fill_lootbox_contract
from python.src.util.log_util import log_event

app = FastAPI(root_path="/api")
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


logger = logging.getLogger(__name__)


@app.post('/fill_lootbox')
async def fill_lootbox(app_id: int, amount: int, buyer_address: str) -> dict:
    log_event("Fill lootbox request received", buyer_address, app_id)

    nfts_left = nfts_left_count()
    if amount <= 0 or amount > 8:
        text = f"Tried not buy wrong number of NFTs: {amount}"
        log_event(text, buyer_address, app_id)
        return JSONResponse(
            status_code = status.HTTP_400_BAD_REQUEST,
            content = { "message": text }
            )
    if nfts_left < amount:
        text = f"Not enough NFTs left: {nfts_left}"
        log_event(text, buyer_address, app_id)
        return JSONResponse(
            status_code = status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE,
            content = { "message": text }
            )
    elif PUBLIC_SALE:
        log_event(f"Trying to fill lootbox...", buyer_address, app_id)
        await fill_lootbox_contract(app_id, amount, buyer_address)
        return JSONResponse(
            status_code = status.HTTP_200_OK, # Should be 204!!!!!!!
            content = { "message": "ok" }
        )
    elif (NO_LIMITS and get_limit(buyer_address) is not None) or can_spend(buyer_address, amount):
        if not NO_LIMITS:
            spend(buyer_address, amount)
        log_event(f"Trying to fill lootbox...", buyer_address, app_id)
        await fill_lootbox_contract(app_id, amount, buyer_address)
        return JSONResponse(
            status_code = status.HTTP_200_OK, # Should be 204!!!!!!!
            content = { "message": "ok" }
        )
    else:
        limit = get_limit(buyer_address)
        if limit is None:
            # not in whitelist
            text = f"Not in whilelist"
            log_event(text, buyer_address, app_id)
            return JSONResponse(
                status_code = status.HTTP_403_FORBIDDEN,
                content = { "message": text }
                )
        else:
            text = f"Limit exceeded. Tried to buy {amount} but can only {limit}"
            log_event(text, buyer_address, app_id)
            return JSONResponse(
                status_code = status.HTTP_402_PAYMENT_REQUIRED, 
                content = { "message": text }
                )


@app.post('/increase_whitelist_limit')
async def increase_whitelist_limit(address: str, amount: int, password: str) -> dict:
    logger.info(f'Increasing limit for {address} by {amount}')

    if not password == API_PASSWORD:
        return {'address': address, 'limit': get_limit(address)}

    cur_limit = increase_limit(address, amount)

    return {'address': address, 'limit': cur_limit}


@app.post('/set_whitelist_limit')
async def set_whitelist_limit(address: str, amount: int, password: str) -> dict:
    logger.info(f'Setting limit for {address} by {amount}')

    if not password == API_PASSWORD:
        return {'address': address, 'limit': get_limit(address)}

    cur_limit = set_limit(address, amount)

    return {'address': address, 'limit': cur_limit}


@app.get('/get_whitelist_limit')
async def get_whitelist_limit(address: str) -> dict:
    logger.info(f'Getting whitelist limit for {address}')

    limit = get_limit(address)

    return {'address': address, 'limit': limit}


@app.get('/nft_count')
async def nft_count() -> dict:
    logger.info(f'Getting nfts count.')

    return {'count': nfts_left_count()}


# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=5000, workers=4)
