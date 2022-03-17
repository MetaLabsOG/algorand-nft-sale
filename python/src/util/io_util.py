from typing import List


def read_int_list(file) -> List[int]:
    lines = [line.strip() for line in file]
    return [int(line) for line in lines if line != '']
