import tempfile
from pathlib import Path
import requests
import pandas as pd

def fetch_emotion_descriptions() -> str:
    """
    Download the sheet, keep columns A (EMOTION) and B (DESCRIPTION),
    and return one multiline string: 'emotion -> description'.
    """
    # 1. Download to a temp file
    url = "https://docs.google.com/spreadsheets/d/1BjKGrf4RkDm3CCHQbCp87ZBuS4BJh972xCOBj2uxPo0/export?format=csv&gid=1631099726"
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
        tmp.write(resp.content)
        tmp_path = Path(tmp.name)

    # 2. Load only the two columns we care about
    df = pd.read_csv(tmp_path, usecols=[0, 1], header=None,
                     names=["EMOTION", "DESCRIPTION"])
    df.dropna(subset=["EMOTION", "DESCRIPTION"], inplace=True)

    # 3. Build the output string
    pairs = [f"{e.strip()} -> {d.strip()}" for e, d in df[["EMOTION", "DESCRIPTION"]].itertuples(index=False)]
    return "\n".join(pairs)

print(fetch_emotion_descriptions())
