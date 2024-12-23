import json
import sys

def parse_student_id():
    try:
        data = json.load(sys.stdin)
        print(data['id'])
    except Exception as e:
        print(f"Error parsing student ID: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    parse_student_id()
