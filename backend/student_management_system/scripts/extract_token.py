import sys
import json

def extract_token():
    try:
        data = json.load(sys.stdin)
        return data['access_token']
    except Exception as e:
        print(f"Error extracting token: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    print(extract_token())
