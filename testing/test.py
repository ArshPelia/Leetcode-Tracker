#!/usr/bin/env python3

import requests
import json
import argparse
from requests.exceptions import HTTPError, ConnectionError, Timeout, RequestException
import sys
# Load environment variables from file
from dotenv import load_dotenv
import os

# Specify the path to your environment file
load_dotenv(".venv")

# URL
LEETCODE_INFO_URL = "https://lcid.cc/info/"
LEETCODE_URL = "https://leetcode.com/problems/"



def get_leetcode_info_by_id(id):
    try:
        leetcode_url = f"{LEETCODE_INFO_URL}{id}"
        resInfo = requests.get(leetcode_url, timeout=3)
        resInfo = resInfo.json()
        if "code" in resInfo:
            if resInfo["code"] != 200:
                raise RequestException(resInfo["message"])
            resInfo.raise_for_status()
        return resInfo
    except HTTPError as errh:
        sys.exit(errh)
    except ConnectionError as errc:
        sys.exit(errc)
    except Timeout as errt:
        sys.exit(errt)
    except RequestException as err:
        sys.exit(err)



# def main():
#     parser = argparse.ArgumentParser(
#         description="Generate leetcode question to fill up Notion for tracking of questions")
#     parser.add_argument("leetcode_number", type=int,
#                         help="leetcode question number")
#     parser.add_argument(
#         "comment", nargs="?", default="", help="optional comment for the question"
#     )
#     args = parser.parse_args()

#     leetcode_number_input_by_user = args.leetcode_number
#     leetcode_comment_input_by_user = args.comment

#     leet_code = get_leetcode_info_by_id(leetcode_number_input_by_user)

#     difficulty = leet_code["difficulty"]
#     name = leet_code["title"]
#     nameForURL = leet_code["titleSlug"]


#     print(leet_code.keys())


# if __name__ == '__main__':
#     main()