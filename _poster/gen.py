import json, os, subprocess, time, urllib.request, urllib.error
from pathlib import Path
API_URL="https://chat.aiwaves.tech/aigram/api/gen-image"
HEADERS={"Content-Type":"application/json","Origin":"https://aigram.app","Referer":"https://aigram.app/","User-Agent":"Mozilla/5.0"}
def gen(prompt,retries=3,timeout=360):
    data=json.dumps({"prompt":prompt}).encode();last=None
    for a in range(retries):
        try:
            req=urllib.request.Request(API_URL,data=data,method="POST",headers=HEADERS)
            with urllib.request.urlopen(req,timeout=timeout) as r: body=json.loads(r.read())
            if body.get("url"): return body["url"]
            raise RuntimeError(f"no url: {body}")
        except Exception as e:
            last=e; print("retry",a+1,e,flush=True); time.sleep(8*(a+1))
    raise last
def dl(url,out):
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"})
    with urllib.request.urlopen(req,timeout=60) as r: d=r.read()
    ext=os.path.splitext(url.split("?")[0])[1].lower()
    if ext and ext!=".png":
        tmp=out.with_suffix(out.suffix+ext); tmp.write_bytes(d)
        subprocess.run(["sips","-s","format","png",str(tmp),"--out",str(out)],check=True,capture_output=True); tmp.unlink()
    else: out.write_bytes(d)
prompt=("A teetering leaning tower of colorful hard-shell travel suitcases stacked precariously "
        "on a small candlelit bistro dinner table for two, dim romantic restaurant with warm bokeh "
        "string lights and two wine glasses, playful stylized 3D render, vibrant saturated luggage in "
        "teal pink gold coral lavender, cinematic moody warm lighting, sense of imminent collapse, "
        "fills the entire square frame edge to edge, full-bleed, NO border NO panel NO text NO letterbox NO matte")
url=gen(prompt); print("URL:",url,flush=True)
dl(url,Path("_poster/keyart.png")); print("saved _poster/keyart.png",flush=True)
