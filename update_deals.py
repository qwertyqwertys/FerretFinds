import json
import os
from github import Github

# Get token from the environment variable (The GitHub Action provides this)
token = os.getenv('GH_TOKEN')
g = Github(token)
repo = g.get_repo("qwertyqwertys/FerretFinds")

# Your new data
new_data = [
    {"store": "DG", "name": "Test Item", "upc": "12345", "sku": "67890", "added": "Today", "originalPrice": 10.00, "clearancePrice": 0.01, "isPenny": True, "dept": "Test", "timestamp": 1782500000000}
]

# Update the file in the repo
contents = repo.get_contents("data/live-deals.txt")
repo.update_file(
    path=contents.path,
    message="Automated inventory update",
    content=json.dumps(new_data, indent=4),
    sha=contents.sha
)
